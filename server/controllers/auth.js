import { pool, query } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { publishEmailNotification } from "../rabbitmq.js";
import crypto from "crypto";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    console.log(
      "[Auth Error] Токен отсутствует в куках (401). Пользователь не залогинен."
    );
    return res.status(401).json("Вы не авторизованы! Нет токена.");
  }

  const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret_key";

  jwt.verify(token, SECRET_KEY, (err, userInfo) => {
    if (err) {
      console.error(
        "[Auth Error] Токен недействителен (403). Ошибка JWT:",
        err.message
      );
      return res.status(403).json("Токен недействителен или просрочен!");
    }

    req.userInfo = userInfo;

    next();
  });
};

// Регистрация
export const register = async (req, res) => {
  console.log("REGISTER BODY:", req.body);
  try {
    let { username, email, password } = req.body ?? {};

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email и password обязательны" });
    }

    username = String(username).trim();
    email = String(email).trim().toLowerCase();
    password = String(password);

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Пароль должен быть не короче 6 символов" });
    }

    // Проверяем, есть ли пользователь с таким именем или email
    const { rows: existing } = await query(
      "SELECT 1 FROM users WHERE username = $1 OR email = $2 LIMIT 1",
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "username или email уже заняты" });
    }

    // Хэшируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // Добавляем пользователя
    const sql = `
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, username, email, role, avatar_url, created_at
      `;
    const { rows } = await query(sql, [username, email, passwordHash]);
    const user = rows[0];

    publishEmailNotification("WELCOME", user.email, {
      username: user.username,
    });

    return res.status(201).json({
      message: "Пользователь зарегистрирован",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    console.error("[auth/register] error:", err.message);
    if (err.code === "23505") {
      return res.status(409).json({ error: "username или email уже заняты" });
    }
    return res.status(500).json({ error: "Ошибка сервера" });
  }
};

// Вход
export const login = async (req, res) => {
  try {
    let { username, email, password } = req.body ?? {};

    if ((!username && !email) || !password) {
      return res
        .status(400)
        .json({ error: "Нужны (username или email) и password" });
    }

    const field = email ? "email" : "username";
    const value = email || username;

    // Находим пользователя
    const { rows } = await query(
      `SELECT id, username, email, password_hash, role, avatar_url FROM users WHERE ${field} = $1 LIMIT 1`,
      [value]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Неверные учетные данные" });
    }

    const user = rows[0];

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Неверные учетные данные" });
    }

    // Генерация JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "7d" }
    );

    return res
      .cookie("accessToken", token, {
        httpOnly: true,
      })
      .status(200)
      .json({
        message: "Вход выполнен",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
        },
        token,
      });
  } catch (err) {
    console.error("[auth/login] error:", err?.message || err);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

// Выход
export const logout = (req, res) => {
  res
    .clearCookie("accessToken", {
      secure: true,
      sameSite: "none",
    })
    .status(200)
    .json("logout successful");
};

// Забыли пароль - отправка кода на почту
export const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body ?? {};

    if (!email) {
      return res.status(400).json({ error: "Email обязателен" });
    }

    email = String(email).trim().toLowerCase();

    // Проверяем существование пользователя
    const { rows } = await query(
      "SELECT id, username, email FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const user = rows[0];

    // Генерируем 6-значный код
    const recoveryCode = crypto.randomInt(100000, 999999).toString();

    // Устанавливаем срок действия кода (15 минут)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Сохраняем код в базу данных
    await query(
      `INSERT INTO password_reset_codes (user_id, code, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id)
       DO UPDATE SET code = $2, expires_at = $3, created_at = NOW()`,
      [user.id, recoveryCode, expiresAt]
    );

    // Отправляем код на почту через RabbitMQ
    publishEmailNotification("RESET_PASSWORD", user.email, {
      username: user.username,
      recovery_code: recoveryCode,
    });

    return res.status(200).json({
      message: "Код для сброса пароля отправлен на почту",
    });
  } catch (err) {
    console.error("[auth/forgot-password] error:", err.message);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
};

// Сброс пароля с проверкой кода
export const resetPassword = async (req, res) => {
  try {
    let { email, code, newPassword } = req.body ?? {};

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    email = String(email).trim().toLowerCase();
    code = String(code).trim();

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Пароль должен быть не короче 6 символов" });
    }

    // Находим пользователя
    const { rows: userRows } = await query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const userId = userRows[0].id;

    // Проверяем код и срок действия
    const { rows: codeRows } = await query(
      `SELECT code, expires_at FROM password_reset_codes
       WHERE user_id = $1 AND code = $2 AND expires_at > NOW()
       LIMIT 1`,
      [userId, code]
    );

    if (codeRows.length === 0) {
      return res.status(400).json({ error: "Неверный или истёкший код" });
    }

    // Хэшируем новый пароль
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль
    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      passwordHash,
      userId,
    ]);

    // Удаляем использованный код
    await query("DELETE FROM password_reset_codes WHERE user_id = $1", [
      userId,
    ]);

    return res.status(200).json({
      message: "Пароль успешно изменён",
    });
  } catch (err) {
    console.error("[auth/reset-password] error:", err.message);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const verifyOldEmail = async (req, res) => {
  try {
    let { email } = req.body ?? {};

    if (!email) {
      return res.status(400).json({ error: "Email обязателен" });
    }

    email = String(email).trim().toLowerCase();

    const { rows } = await query(
      "SELECT id, username, email FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const user = rows[0];

    const verificationCode = crypto.randomInt(100000, 999999).toString();

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await query(
      `INSERT INTO email_change_codes (user_id, old_email, verification_code, expires_at, step)
       VALUES ($1, $2, $3, $4, 'verify_old')
       ON CONFLICT (user_id)
       DO UPDATE SET verification_code = $3, expires_at = $4, old_email = $2, step = 'verify_old', created_at = NOW()`,
      [user.id, email, verificationCode, expiresAt]
    );

    publishEmailNotification("EMAIL_CHANGE_CODE", user.email, {
      username: user.username,
      change_code: verificationCode,
    });

    return res.status(200).json({
      message: "Код отправлен на вашу почту",
    });
  } catch (err) {
    console.error("[auth/verify-old-email] error:", err.message);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const verifyOldEmailCode = async (req, res) => {
  try {
    let { email, code, newEmail } = req.body ?? {};

    if (!email || !code || !newEmail) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    email = String(email).trim().toLowerCase();
    newEmail = String(newEmail).trim().toLowerCase();
    code = String(code).trim();

    if (email === newEmail) {
      return res.status(400).json({ error: "Новая почта совпадает со старой" });
    }

    const { rows: existingEmail } = await query(
      "SELECT 1 FROM users WHERE email = $1 LIMIT 1",
      [newEmail]
    );

    if (existingEmail.length > 0) {
      return res.status(409).json({ error: "Эта почта уже используется" });
    }

    const { rows: userRows } = await query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const userId = userRows[0].id;

    const { rows: codeRows } = await query(
      `SELECT verification_code, expires_at, step FROM email_change_codes
       WHERE user_id = $1 AND verification_code = $2 AND expires_at > NOW() AND step = 'verify_old'
       LIMIT 1`,
      [userId, code]
    );

    if (codeRows.length === 0) {
      return res.status(400).json({ error: "Неверный или истёкший код" });
    }

    const newVerificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await query(
      `UPDATE email_change_codes
       SET new_email = $1, new_email_code = $2, expires_at = $3, step = 'verify_new', created_at = NOW()
       WHERE user_id = $4`,
      [newEmail, newVerificationCode, expiresAt, userId]
    );

    publishEmailNotification("EMAIL_CHANGE_CODE", newEmail, {
      change_code: newVerificationCode,
    });

    return res.status(200).json({
      message: "Код отправлен на новую почту",
    });
  } catch (err) {
    console.error("[auth/verify-old-email-code] error:", err.message);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const changeEmail = async (req, res) => {
  try {
    let { email, newEmail, newEmailCode } = req.body ?? {};

    if (!email || !newEmail || !newEmailCode) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    email = String(email).trim().toLowerCase();
    newEmail = String(newEmail).trim().toLowerCase();
    newEmailCode = String(newEmailCode).trim();

    const { rows: userRows } = await query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const userId = userRows[0].id;

    const { rows: codeRows } = await query(
      `SELECT new_email, new_email_code, expires_at, step FROM email_change_codes
       WHERE user_id = $1 AND new_email = $2 AND new_email_code = $3
       AND expires_at > NOW() AND step = 'verify_new'
       LIMIT 1`,
      [userId, newEmail, newEmailCode]
    );

    if (codeRows.length === 0) {
      return res.status(400).json({ error: "Неверный или истёкший код" });
    }

    await query("UPDATE users SET email = $1 WHERE id = $2", [
      newEmail,
      userId,
    ]);

    await query("DELETE FROM email_change_codes WHERE user_id = $1", [userId]);

    return res.status(200).json({
      message: "Email успешно изменён",
    });
  } catch (err) {
    console.error("[auth/change-email] error:", err.message);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const getProfile = async (req, res) => {
  const userId = req.userInfo.id;

  try {
    const q = `
      SELECT
          u.id,
          u.username,
          u.email,
          u.role,
          u.bio,
          u.avatar_url AS img,
          u.rated_games AS "ratedGames",
          u.created_at AS "registrationDate",
          COALESCE(
              json_agg(g.name ORDER BY g.name) FILTER (WHERE g.name IS NOT NULL),
              '{}'::json
          ) as "favoriteGenres"
      FROM users u
      LEFT JOIN favorites_genres fg ON u.id = fg.user_id
      LEFT JOIN genres g ON fg.genre_id = g.id
      WHERE u.id = $1
      GROUP BY u.id, u.username, u.email, u.role, u.bio, u.avatar_url, u.created_at, u.rated_games;
    `;

    const result = await query(q, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json("Пользователь не найден.");
    }

    const userData = result.rows[0];

    return res.status(200).json(userData);
  } catch (err) {
    console.error("Ошибка при получении профиля:", err);
    return res.status(500).json(err);
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.userInfo.id;

  const {
    username,
    email,
    bio,
    avatar_url: img,
    oldPassword,
    newPassword,
  } = req.body;

  let updateQuery = "UPDATE users SET";
  const updateValues = [];
  let queryParts = [];
  let paramCount = 1;

  if (username) {
    queryParts.push(`username = $${paramCount++}`);
    updateValues.push(username);
  }

  if (email) {
    queryParts.push(`email = $${paramCount++}`);
    updateValues.push(email);
  }

  if (bio !== undefined) {
    queryParts.push(`bio = $${paramCount++}`);
    updateValues.push(bio === "" ? null : bio);
  }

  if (img !== undefined) {
    queryParts.push(`avatar_url = $${paramCount++}`);
    updateValues.push(img === "" ? null : img);
  }

  if (newPassword && oldPassword) {
    try {
      const userResult = await query(
        "SELECT password_hash FROM users WHERE id = $1",
        [userId]
      );
      if (userResult.rows.length === 0) {
        return res.status(404).json("Пользователь не найден.");
      }
      const user = userResult.rows[0];

      const isPasswordCorrect = await bcrypt.compare(
        oldPassword,
        user.password_hash
      );
      if (!isPasswordCorrect) {
        return res.status(401).json("Неверный старый пароль.");
      }

      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      queryParts.push(`password_hash = $${paramCount++}`);
      updateValues.push(newPasswordHash);
    } catch (err) {
      console.error("Ошибка при смене пароля:", err);
      return res.status(500).json("Ошибка сервера при смене пароля.");
    }
  } else if (newPassword || oldPassword) {
    return res
      .status(400)
      .json(
        "Для смены пароля необходимо предоставить и старый, и новый пароли."
      );
  }

  if (queryParts.length === 0) {
    return res.status(400).json("Нет данных для обновления.");
  }

  updateQuery += " " + queryParts.join(", ") + ` WHERE id = $${paramCount}`;
  updateValues.push(userId);

  try {
    const result = await query(updateQuery, updateValues);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json("Обновление не удалось: Пользователь не найден.");
    }

    const message = newPassword
      ? "Профиль и пароль успешно обновлены. Рекомендуется повторный вход."
      : "Профиль успешно обновлен.";

    return res.status(200).json(message);
  } catch (err) {
    if (err.code === "23505") {
      let field = "данных";
      if (err.detail.includes("username")) field = "имени пользователя";
      if (err.detail.includes("email")) field = "почты";
      return res
        .status(409)
        .json(`Ошибка: указанные ${field} уже используются.`);
    }
    console.error("Ошибка при обновлении профиля:", err);
    return res.status(500).json("Ошибка сервера при обновлении профиля.");
  }
};

export const updateFavoriteGenres = async (req, res) => {
  const userId = req.userInfo.id;
  const { favoriteGenres: genreNames } = req.body;

  if (!Array.isArray(genreNames)) {
    return res.status(400).json("Ожидается массив любимых жанров.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query("DELETE FROM favorites_genres WHERE user_id = $1", [
      userId,
    ]);

    if (genreNames.length === 0) {
      await client.query("COMMIT");
      return res.status(200).json("Список любимых жанров очищен.");
    }

    const genreIdsResult = await client.query(
      `
            SELECT id
            FROM genres
            WHERE name = ANY($1::text[]);
            `,
      [genreNames]
    );

    const genreIds = genreIdsResult.rows.map((row) => row.id);

    if (genreIds.length !== genreNames.length) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json(
          "Один или несколько указанных жанров не существуют в базе данных."
        );
    }

    let insertQuery =
      "INSERT INTO favorites_genres (user_id, genre_id) VALUES ";
    const insertParams = [];
    let valuePlaceholders = [];
    let paramCount = 1;

    for (const genreId of genreIds) {
      valuePlaceholders.push(`($${paramCount++}, $${paramCount++})`);
      insertParams.push(userId);
      insertParams.push(genreId);
    }

    insertQuery += valuePlaceholders.join(", ");

    await client.query(insertQuery, insertParams);

    await client.query("COMMIT");
    return res.status(200).json("Любимые жанры успешно обновлены.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Ошибка при обновлении жанров:", err);
    return res.status(500).json("Ошибка сервера при обновлении жанров.");
  } finally {
    client.release();
  }
};
