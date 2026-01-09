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

export const forgotPassword = async (req, res) => {
  return res.status(501).json({ error: "Not implemented in this patch" });
};

export const resetPassword = async (req, res) => {
  return res.status(501).json({ error: "Not implemented in this patch" });
};

export const verifyOldEmail = async (req, res) => {
  return res.status(501).json({ error: "Not implemented in this patch" });
};

export const verifyOldEmailCode = async (req, res) => {
  return res.status(501).json({ error: "Not implemented in this patch" });
};

export const changeEmail = async (req, res) => {
  return res.status(501).json({ error: "Not implemented in this patch" });
};

export const updateProfile = async (req, res) => {
  return res.status(501).json({ error: "Not implemented in this patch" });
};

export const updateFavoriteGenres = async (req, res) => {
  return res.status(501).json({ error: "Not implemented in this patch" });
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
