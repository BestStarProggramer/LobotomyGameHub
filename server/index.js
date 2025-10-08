import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";

dotenv.config();
const app = express();

// --- DATABASE CONNECTION ---
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// --- MIDDLEWARES ---
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// --- ROOT ---
app.get("/", (req, res) => {
  res.json({ message: "LobotomyGameHub API is running!" });
});

// --- ARTICLES ---
app.get("/articles", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.id, a.user_id, a.game_id, a.title, a.content, a.category, a.created_at,
             u.username, g.title AS game_title
      FROM articles a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN games g ON a.game_id = g.id
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/articles/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT a.id, a.user_id, a.game_id, a.title, a.content, a.category, a.created_at,
             u.username, g.title AS game_title
      FROM articles a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN games g ON a.game_id = g.id
      WHERE a.id = ?
    `,
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: "Article not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/articles", async (req, res) => {
  const { user_id, game_id, title, content, category } = req.body;
  if (!user_id || !title || !category)
    return res
      .status(400)
      .json({ message: "Missing required fields: user_id, title, category" });
  try {
    const [result] = await db.query(
      `
      INSERT INTO articles (user_id, game_id, title, content, category)
      VALUES (?, ?, ?, ?, ?)
    `,
      [user_id, game_id || null, title, content || null, category]
    );
    res.status(201).json({ id: result.insertId, message: "Article created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/articles/:id", async (req, res) => {
  try {
    const articleId = parseInt(req.params.id, 10);
    if (isNaN(articleId))
      return res.status(400).json({ message: "Invalid article ID" });

    // Заголовки с фронта
    const userId = parseInt(req.headers["x-user-id"], 10);
    const userRole = req.headers["x-user-role"];

    if (!userId || !userRole)
      return res.status(401).json({ message: "Unauthorized: no user info" });

    // Проверка авторства
    const [rows] = await db.query("SELECT user_id FROM articles WHERE id = ?", [
      articleId,
    ]);
    if (!rows.length)
      return res.status(404).json({ message: "Article not found" });

    const articleOwnerId = rows[0].user_id;
    if (userRole !== "admin" && userId !== articleOwnerId) {
      return res
        .status(403)
        .json({ message: "Нет прав на редактирование этой статьи" });
    }

    // Формируем обновление
    const { title, content, category, game_id } = req.body;
    const fields = [];
    const values = [];

    if (title !== undefined) {
      fields.push("title = ?");
      values.push(title);
    }
    if (content !== undefined) {
      fields.push("content = ?");
      values.push(content);
    }
    if (category !== undefined) {
      fields.push("category = ?");
      values.push(category);
    }
    if (game_id !== undefined) {
      fields.push("game_id = ?");
      values.push(game_id);
    }

    if (!fields.length)
      return res.status(400).json({ message: "No fields to update" });

    values.push(articleId);
    await db.query(
      `UPDATE articles SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    res.json({ message: "Article updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/articles/:id", async (req, res) => {
  try {
    const [result] = await db.query(`DELETE FROM articles WHERE id = ?`, [
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Article not found" });
    res.json({ message: "Article deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CATALOG / GAMES ---
app.get("/catalog", async (req, res) => {
  const { sort } = req.query;
  let q = "SELECT * FROM games";

  if (sort === "popular") q += " ORDER BY rating DESC LIMIT 10";
  else if (sort === "recent") q += " ORDER BY release_date DESC LIMIT 10";
  else if (sort === "recommended") q += " ORDER BY RAND() LIMIT 10";
  else q += " ORDER BY title";

  try {
    const [data] = await db.query(q);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/catalog/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT g.id, g.title, g.description, g.release_date, g.developer, g.publisher, g.rating, g.cover_url,
             GROUP_CONCAT(ge.name SEPARATOR ', ') AS genres
      FROM games g
      LEFT JOIN game_genres gg ON g.id = gg.game_id
      LEFT JOIN genres ge ON gg.genre_id = ge.id
      WHERE g.id = ?
      GROUP BY g.id
    `,
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: "Game not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/catalog", async (req, res) => {
  const {
    title,
    description,
    release_date,
    developer,
    publisher,
    rating,
    cover_url,
  } = req.body;
  if (!title)
    return res.status(400).json({ message: "Missing required field: title" });
  try {
    const [result] = await db.query(
      `
      INSERT INTO games (title, description, release_date, developer, publisher, rating, cover_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        title,
        description || null,
        release_date || null,
        developer || null,
        publisher || null,
        rating ?? null,
        cover_url || null,
      ]
    );
    res.status(201).json({ id: result.insertId, message: "Game created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- USER PROFILE ---
app.get("/user/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId))
      return res.status(400).json({ message: "Invalid user ID" });

    const [rows] = await db.query(
      `SELECT id, username, email, avatar_url, role FROM users WHERE id = ?`,
      [userId]
    );

    if (!rows.length)
      return res.status(404).json({ message: "User not found" });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/user/:id/articles", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM articles WHERE user_id = ? ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- USER REVIEWS ---
app.get("/user/:id/reviews", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT r.*, g.title AS game_title
      FROM reviews r
      LEFT JOIN games g ON r.game_id = g.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GAME REVIEWS ---
app.get("/game/:id/reviews", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT r.id, r.game_id, r.user_id, r.rating, r.content, r.created_at, u.username
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.game_id = ?
      ORDER BY r.created_at DESC
    `,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/game/:id/review/create", async (req, res) => {
  const { user_id, rating, content } = req.body;
  if (!user_id || !rating || !content)
    return res
      .status(400)
      .json({ message: "Missing required fields: user_id, rating, content" });
  try {
    const [result] = await db.query(
      `INSERT INTO reviews (game_id, user_id, rating, content) VALUES (?, ?, ?, ?)`,
      [req.params.id, user_id, rating, content]
    );
    res
      .status(201)
      .json({ id: result.insertId, message: "Review created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REGISTER ---
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "Missing required fields" });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`,
      [username, email, hashedPassword]
    );
    res.status(201).json({ id: result.insertId, message: "User registered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- LOGIN ---
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing required fields" });
  try {
    const [rows] = await db.query(
      `SELECT id, username, email, password_hash FROM users WHERE email = ?`,
      [email]
    );
    if (!rows.length)
      return res.status(401).json({ message: "Invalid email or password" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      message: "Login successful",
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 8800;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
