import express from "express";
import cors from "cors";
import "dotenv/config"; // Загрузка переменных окружения
import { query } from "./db.js"; // Импорт функции для выполнения запросов к БД
import authRouter from "./routes/auth.js";
import cookieParser from "cookie-parser";
import https from "https";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 8800; // Используем порт из .env или 8800

const key = fs.readFileSync("./localhost.key");
const cert = fs.readFileSync("./localhost.cert");

// --- 1. Настройка Middleware ---
// Разрешаем Cross-Origin Resource Sharing (CORS) для фронтенда
app.use(
  cors({
    origin: "http://localhost:3000", // Укажите адрес вашего клиента
    credentials: true,
  })
);

// Парсер для входящих запросов в формате JSON
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

// --- 3. Запуск сервера ---
// https.createServer({ key, cert }, app).listen(PORT, () => {
//   console.log(
//     `[Server] HTTPS backend server is running on https://localhost:${PORT}`
//   );
// });
app.listen(PORT, () => {
  console.log(
    `[Server] HTTP backend server is running on http://localhost:${PORT}`
  );
});
