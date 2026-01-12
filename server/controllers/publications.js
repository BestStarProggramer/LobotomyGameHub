import { query } from "../db.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
        p.views,
        u.id AS author_id,
        u.username,
        u.avatar_url,
        g.title AS game_title,
        (SELECT COUNT(*) FROM comments WHERE publication_id = p.id) AS comments_count,
        (SELECT COUNT(*) FROM publication_likes WHERE publication_id = p.id) AS likes_count
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
        id: row.author_id,
        username: row.username || "Неизвестный автор",
        avatar: row.avatar_url || "/img/default-avatar.jpg",
      },
      date: new Date(row.created_at).toLocaleDateString("ru-RU"),
      commentsCount: Number(row.comments_count) || 0,
      likesCount: Number(row.likes_count) || 0,
      views: Number(row.views) || 0,
      imageUrl: row.image || "/img/game_poster.jpg",
      content: row.content,
      gameTitle: row.game_title,
    }));

    res.status(200).json(publications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const getPublicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.userInfo ? req.userInfo.id : null;

    const q = `
      SELECT 
        p.id,
        p.type,
        p.title,
        p.content,
        p.image,
        p.views,
        p.created_at,
        u.id AS author_id,
        u.username,
        u.avatar_url,
        g.title AS game_title,
        (SELECT COUNT(*) FROM comments WHERE publication_id = p.id) AS comments_count,
        (SELECT COUNT(*) FROM publication_likes WHERE publication_id = p.id) AS likes_count,
        CASE 
          WHEN $2::bigint IS NOT NULL THEN 
            EXISTS(SELECT 1 FROM publication_likes pl WHERE pl.publication_id = p.id AND pl.user_id = $2)
          ELSE FALSE 
        END as is_liked
      FROM publications p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN games g ON p.game_id = g.id
      WHERE p.id = $1
    `;

    const result = await query(q, [id, currentUserId]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Публикация не найдена" });
    }

    const row = result.rows[0];

    res.status(200).json({
      id: row.id,
      type: row.type,
      title: row.title,
      author: {
        id: row.author_id,
        username: row.username || "Неизвестный автор",
        avatar: row.avatar_url || "/img/default-avatar.jpg",
      },
      date: new Date(row.created_at).toLocaleDateString("ru-RU"),
      commentsCount: Number(row.comments_count) || 0,
      views: Number(row.views) || 0,
      likes: Number(row.likes_count) || 0,
      isLiked: row.is_liked,
      imageUrl: row.image || "/img/game_poster.jpg",
      content: row.content,
      gameTitle: row.game_title,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userInfo.id;

    const checkQ =
      "SELECT 1 FROM publication_likes WHERE user_id = $1 AND publication_id = $2";
    const checkRes = await query(checkQ, [userId, id]);

    let isLiked = false;

    if (checkRes.rows.length > 0) {
      await query(
        "DELETE FROM publication_likes WHERE user_id = $1 AND publication_id = $2",
        [userId, id]
      );
      isLiked = false;
    } else {
      await query(
        "INSERT INTO publication_likes (user_id, publication_id) VALUES ($1, $2)",
        [userId, id]
      );
      isLiked = true;
    }

    const countRes = await query(
      "SELECT COUNT(*) FROM publication_likes WHERE publication_id = $1",
      [id]
    );
    const likesCount = parseInt(countRes.rows[0].count, 10);

    await query("UPDATE publications SET likes = $1 WHERE id = $2", [
      likesCount,
      id,
    ]);

    return res.status(200).json({ likesCount, isLiked });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Ошибка при лайке" });
  }
};

export const incrementView = async (req, res) => {
  try {
    const { id } = req.params;

    await query("UPDATE publications SET views = views + 1 WHERE id = $1", [
      id,
    ]);

    const resCount = await query(
      "SELECT views FROM publications WHERE id = $1",
      [id]
    );
    const views = resCount.rows[0]?.views || 0;

    return res.status(200).json({ views });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Ошибка при обновлении просмотров" });
  }
};

export const updatePublication = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, game_id } = req.body;
    const { id: userId, role } = req.userInfo;

    const check = await query("SELECT * FROM publications WHERE id = $1", [id]);
    if (!check.rows.length) {
      return res.status(404).json({ error: "Публикация не найдена" });
    }

    const publication = check.rows[0];

    if (
      publication.user_id !== userId &&
      role !== "staff" &&
      role !== "admin"
    ) {
      return res.status(403).json({ error: "Нет прав" });
    }

    let image = publication.image;

    if (req.file) {
      if (image && image.startsWith("/upload/")) {
        const path = join(process.cwd(), "client/public", image);
        if (fs.existsSync(path)) fs.unlinkSync(path);
      }
      image = `/upload/${req.file.filename}`;
    }

    const validType = type === "news" ? "news" : "article";
    const validGameId = game_id && !isNaN(game_id) ? Number(game_id) : null;

    const q = `
      UPDATE publications
      SET title=$1, content=$2, type=$3, game_id=$4, image=$5, updated_at=NOW()
      WHERE id=$6
      RETURNING id
    `;

    await query(q, [title, content, validType, validGameId, image, id]);

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const addPublication = async (req, res) => {
  try {
    const { title, content, type, game_id } = req.body;
    const { id: userId, role } = req.userInfo;

    if (role !== "staff" && role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const image = req.file ? `/upload/${req.file.filename}` : null;
    const validType = type === "news" ? "news" : "article";
    const validGameId = game_id && !isNaN(game_id) ? Number(game_id) : null;

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

    res.status(200).json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const deletePublication = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.userInfo;

    const check = await query("SELECT * FROM publications WHERE id = $1", [id]);
    if (!check.rows.length) {
      return res.status(404).json({ error: "Публикация не найдена" });
    }

    const publication = check.rows[0];

    if (
      publication.user_id !== userId &&
      role !== "staff" &&
      role !== "admin"
    ) {
      return res.status(403).json({ error: "Нет прав" });
    }

    if (publication.image && publication.image.startsWith("/upload/")) {
      const path = join(process.cwd(), "client/public", publication.image);
      if (fs.existsSync(path)) fs.unlinkSync(path);
    }

    await query("DELETE FROM publications WHERE id = $1", [id]);

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};
