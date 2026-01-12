import { query } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { publishEmailNotification } from "../rabbitmq.js";

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret_key";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "30d";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const signToken = (userPayload) => {
  return jwt.sign(userPayload, SECRET_KEY, {
    expiresIn: JWT_EXPIRES,
  });
};

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      console.log(
        "[Auth Error] Токен отсутствует в куках (401). Пользователь не залогинен."
      );
      return res.status(401).json("Вы не авторизованы! Нет токена.");
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        console.error(
          "[Auth Error] Токен недействителен (403). Ошибка JWT:",
          err.message
        );
        return res.status(403).json("Токен недействителен или просрочен!");
      }

      req.userInfo = decoded;

      const payload = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
      };

      const newToken = signToken(payload);
      res.cookie("accessToken", newToken, cookieOptions);

      next();
    });
  } catch (err) {
    console.error("[verifyToken] unexpected error:", err);
    return res.status(500).json("Ошибка сервера при проверке токена");
  }
};

export const register = async (req, res) => {
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

    const { rows: existing } = await query(
      "SELECT 1 FROM users WHERE username = $1 OR email = $2 LIMIT 1",
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "username или email уже заняты" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, role, avatar_url, created_at
    `;
    const { rows } = await query(sql, [username, email, passwordHash]);
    const user = rows[0];

    try {
      publishEmailNotification("WELCOME", user.email, {
        username: user.username,
      });
    } catch (e) {
      console.warn("Не удалось отправить WELCOME письмо:", e.message);
    }

    return res.status(201).json({ user });
  } catch (err) {
    console.error("[auth/register] error:", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, email, password } = req.body ?? {};

    if ((!username && !email) || !password) {
      return res.status(400).json({ error: "credentials are required" });
    }

    const identity = username ? username : email;

    const q =
      username && !email
        ? "SELECT id, username, email, password_hash, role, avatar_url FROM users WHERE username = $1 LIMIT 1"
        : "SELECT id, username, email, password_hash, role, avatar_url FROM users WHERE email = $1 LIMIT 1";

    const { rows } = await query(q, [identity]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Неверный логин или пароль" });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Неверный логин или пароль" });
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    const token = signToken(payload);

    res.cookie("accessToken", token, cookieOptions);

    const responseUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
    };

    return res.status(200).json({ user: responseUser });
  } catch (err) {
    console.error("[auth/login] error:", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.status(200).json({ message: "Logged out" });
  } catch (err) {
    console.error("[auth/logout] error:", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.userInfo?.id;
    if (!userId) return res.status(401).json("Пользователь не найден");

    const q = `
      SELECT
        u.id,
        u.username,
        u.email,
        u.role,
        u.bio,
        u.avatar_url,
        u.rated_games as "ratedGames",
        u.created_at as "registrationDate"
      FROM users u
      WHERE u.id = $1
      LIMIT 1
    `;

    const { rows } = await query(q, [userId]);
    if (rows.length === 0)
      return res.status(404).json("Пользователь не найден");

    const userData = rows[0];

    return res.status(200).json({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      bio: userData.bio,
      avatar_url: userData.avatar_url,
      ratedGames: userData.ratedGames,
      registrationDate: userData.registrationDate,
    });
  } catch (err) {
    console.error("[auth/getProfile] error:", err);
    return res.status(500).json("Ошибка сервера");
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

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const userQuery = `
      SELECT 
        id,
        username,
        avatar_url,
        bio,
        role,
        created_at as "registrationDate",
        rated_games as "ratedGames"
      FROM users 
      WHERE id = $1
    `;

    const userResult = await query(userQuery, [userId]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    if (user.registrationDate) {
      user.registrationDate = new Date(
        user.registrationDate
      ).toLocaleDateString("ru-RU");
    }

    if (!user.avatar_url) {
      user.avatar_url = "/img/default-avatar.jpg";
    }

    res.json(user);
  } catch (err) {
    console.error("Ошибка получения публичного профиля:", err);
    res.status(500).json({ error: "Ошибка сервера при получении профиля" });
  }
};

export const getFavoriteGenres = async (req, res) => {
  try {
    const userId = req.params.id;

    const q = `
      SELECT g.name
      FROM favorites_genres fg
      JOIN genres g ON fg.genre_id = g.id
      WHERE fg.user_id = $1
      ORDER BY g.name
    `;

    const result = await query(q, [userId]);
    const genres = result.rows.map((row) => row.name);

    res.json(genres);
  } catch (err) {
    console.error("Ошибка получения жанров пользователя:", err);
    res.status(500).json({ error: "Ошибка сервера при получении жанров" });
  }
};
