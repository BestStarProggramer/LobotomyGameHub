import { Router } from "express";
import bcrypt from "bcrypt";
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

export default router;
