import pg from "pg";
import "dotenv/config";

// Создаем пул соединений для эффективного управления подключениями
const pool = new pg.Pool({
	user: process.env.PGUSER,
	host: process.env.PGHOST,
	database: process.env.PGDATABASE,
	password: process.env.PGPASSWORD,
	port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432, // Убедимся, что порт — число
});

// Обработка ошибок пула
pool.on("error", (err) => {
	console.error(
		"[DB Error] Непредвиденная ошибка в пуле PostgreSQL:",
		err.message
	);
});

// Обертка для выполнения SQL-запросов
const query = (text, params) => {
	return pool.query(text, params);
};

console.log(
	`[DB] Пул PostgreSQL инициализирован для БД: ${process.env.PGDATABASE}`
);

export { pool, query };
