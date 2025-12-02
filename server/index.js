import express from "express";
import cors from "cors";
import "dotenv/config"; // Загрузка переменных окружения
import { query } from "./db.js"; // Импорт функции для выполнения запросов к БД
import authRouter from "./routes/auth.js";
import cookieParser from "cookie-parser";
import https from "https";
import fs from "fs";
import axios from "axios";

const RAWG_BASE = "https://api.rawg.io/api";
const RAWG_KEY = process.env.API_KEY;

const app = express();
const PORT = process.env.PORT || 8800; // Используем порт из .env или 8800

app.use(
  cors({
    origin: "http://localhost:3000", // Укажите адрес вашего клиента
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

//подключение роутера регистрации
app.use("/api/auth", authRouter);

// --- 2. API-маршрут здоровья (Health Check) ---
app.get("/api/health", async (req, res) => {
  try {
    // Попытка выполнить простейший запрос к БД
    await query("SELECT 1");

    // Сервер и БД работают
    res.status(200).json({
      status: "ok",
      database: "connected",
      server: `running on port ${PORT}`,
    });
  } catch (error) {
    // БД недоступна
    console.error(
      "[Health Check] Ошибка подключения к базе данных:",
      error.message
    );
    res.status(503).json({
      status: "error",
      database: "disconnected",
      server: `running on port ${PORT}`,
      message: "Database connection failed. Service Unavailable.",
    });
  }
});

app.get("/api/rawg/games", async (req, res) => {
  try {
    const { page = 1, page_size = 20, search = "" } = req.query;

    const params = {
      key: RAWG_KEY,
      page,
      page_size,
    };

    if (search) {
      params.search = search;
    }

    const response = await axios.get(`${RAWG_BASE}/games`, { params });

    res.json(response.data);
  } catch (error) {
    console.error("Ошибка при проксировании RAWG API:", error.message);
    res.status(500).json({ error: "Failed to fetch from RAWG API" });
  }
});

app.listen(PORT, () => {
  console.log(
    `[Server] HTTP backend server is running on http://localhost:${PORT}`
  );
});
