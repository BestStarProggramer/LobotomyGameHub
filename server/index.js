import express from "express";
import cors from "cors";
import "dotenv/config"; // Загрузка переменных окружения
import { query } from "./db.js"; // Импорт функции для выполнения запросов к БД

const app = express();
const PORT = process.env.PORT || 8800; // Используем порт из .env или 8800

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
app.listen(PORT, () => {
	console.log(
		`[Server] Backend server is running on http://localhost:${PORT}`
	);
});
