import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../db.js";

const router = Router();

/**
 * POST /api/auth/register
 * Принимает: { username, email, password }
 */
router.post("/register", async (req, res) => {
  try {
    let { username, email, password } = req.body ?? {};

    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email и password обязательны" });
    }

    username = String(username).trim();
    email = String(email).trim().toLowerCase();
    password = String(password);

    if (password.length < 6) {
      return res.status(400).json({ error: "Пароль должен быть не короче 6 символов" });
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
      RETURNING id, username, email, role, created_at
    `;
    const { rows } = await query(sql, [username, email, passwordHash]);
    const user = rows[0];

    return res.status(201).json({
      message: "Пользователь зарегистрирован",
      user,
    });
  } catch (err) {
    console.error("[auth/register] error:", err.message);
    if (err.code === "23505") {
      return res.status(409).json({ error: "username или email уже заняты" });
    }
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});
//вход в систему
router.post("/login", async (req, res) => {
  try {
    let { username, email, password } = req.body ?? {};

    if ((!username && !email) || !password) {
      return res.status(400).json({ error: "Нужны (username или email) и password" });
    }

    const field = email ? "email" : "username";
    const value = email || username;

    // Находим пользователя
    const { rows } = await query(
      `SELECT id, username, email, password_hash, role FROM users WHERE ${field} = $1 LIMIT 1`,
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
      process.env.JWT_SECRET,  // Берём из .env
      { expiresIn: process.env.JWT_EXPIRES || "7d" }  // Время жизни токена
    );

    return res.json({
      message: "Вход выполнен",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error("[auth/login] error:", err?.message || err);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

export default router; //
