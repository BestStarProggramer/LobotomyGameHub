import { query } from "../db.js";

export const getAllGenres = async (req, res) => {
  try {
    const q = `SELECT name FROM genres ORDER BY name ASC`;
    const result = await query(q);

    const genres = result.rows.map((row) => row.name);

    return res.status(200).json(genres);
  } catch (err) {
    console.error("Ошибка при получении всех жанров из БД:", err);
    return res
      .status(503)
      .json("Не удалось получить список жанров из локальной базы данных.");
  }
};
