import { query } from "../db.js";

export const getPublications = async (req, res) => {
  try {
    const { type } = req.query;

    let queryText = `
      SELECT 
        p.id, 
        p.type, 
        p.title, 
        p.content, 
        p.image,
        p.created_at,
        u.username,
        u.avatar_url,
        g.title as game_title,
        (SELECT COUNT(*) FROM comments WHERE publication_id = p.id) as comments_count
      FROM publications p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN games g ON p.game_id = g.id
      WHERE 1=1
    `;

    const params = [];

    if (type && type !== "all") {
      queryText += ` AND p.type = $${params.length + 1}`;
      params.push(type);
    }

    queryText += ` ORDER BY p.created_at DESC`;

    const result = await query(queryText, params);

    const publications = result.rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      author: {
        username: row.username || "Неизвестный автор",
        avatar: row.avatar_url || "/img/default-avatar.jpg",
      },
      date: new Date(row.created_at).toLocaleDateString("ru-RU"),
      commentsCount: parseInt(row.comments_count) || 0,
      imageUrl: row.image || "/img/game_poster.jpg",
      content: row.content,
      gameTitle: row.game_title,
    }));

    return res.status(200).json(publications);
  } catch (err) {
    console.error("Ошибка при получении публикаций:", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const getPublicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const q = `
      SELECT 
        p.id, 
        p.type, 
        p.title, 
        p.content, 
        p.image,
        p.created_at,
        u.username,
        u.avatar_url,
        g.title as game_title,
        (SELECT COUNT(*) FROM comments WHERE publication_id = p.id) as comments_count
      FROM publications p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN games g ON p.game_id = g.id
      WHERE p.id = $1
    `;

    const result = await query(q, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Публикация не найдена" });
    }

    const row = result.rows[0];

    const publication = {
      id: row.id,
      type: row.type,
      title: row.title,
      author: {
        username: row.username || "Неизвестный автор",
        avatar: row.avatar_url || "/img/default-avatar.jpg",
      },
      date: new Date(row.created_at).toLocaleDateString("ru-RU"),
      commentsCount: parseInt(row.comments_count) || 0,
      imageUrl: row.image || "/img/game_poster.jpg",
      content: row.content,
      gameTitle: row.game_title,
    };

    return res.status(200).json(publication);
  } catch (err) {
    console.error("Ошибка при получении публикации:", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
};

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

    const result = await query(q, [
      userId,
      validGameId,
      validType,
      title,
      content,
      image,
    ]);

    return res.status(200).json({
      message: "Публикация успешно создана!",
      id: result.rows[0].id,
    });
  } catch (err) {
    console.error("Ошибка при создании публикации:", err);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
};
