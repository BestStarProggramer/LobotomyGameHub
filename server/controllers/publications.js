import { query } from "../db.js";

export const addPublication = async (req, res) => {
  try {
    const { title, content, type, game_id } = req.body;
    const userId = req.userInfo.id;
    const image = req.file ? `/upload/${req.file.filename}` : null;
    const validType = type === "news" ? "news" : "article";

    const validGameId =
      game_id && !isNaN(parseInt(game_id)) ? parseInt(game_id) : null;

    const q = `
      INSERT INTO publications (user_id, game_id, type, title, content, image, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id
    `;

    await query(q, [userId, validGameId, validType, title, content, image]);

    return res.status(200).json("Публикация успешно создана!");
  } catch (err) {
    console.error("Ошибка при создании публикации:", err);
    return res.status(500).json(err);
  }
};
