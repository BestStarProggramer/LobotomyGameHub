import { query } from "../db.js";

export const getComments = async (req, res) => {
  try {
    const { publicationId } = req.params;
    const currentUserId = req.userInfo ? req.userInfo.id : null;

    const q = `
      SELECT 
        c.id, 
        c.content, 
        c.created_at, 
        c.parent_id,
        u.id as user_id, 
        u.username, 
        u.avatar_url,
        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) as likes_count,
        CASE 
          WHEN $2::bigint IS NOT NULL THEN 
            EXISTS(SELECT 1 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = $2)
          ELSE FALSE 
        END as is_liked
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.publication_id = $1
      ORDER BY c.created_at ASC
    `;

    const result = await query(q, [publicationId, currentUserId]);

    const comments = result.rows.map((row) => ({
      id: row.id,
      content: row.content,
      created_at: row.created_at,
      parent_id: row.parent_id,
      likes_count: parseInt(row.likes_count, 10),
      is_liked: row.is_liked,
      user: {
        id: row.user_id,
        username: row.username,
        avatar: row.avatar_url || "/img/default-avatar.jpg",
      },
    }));

    return res.status(200).json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    return res
      .status(500)
      .json({ error: "Ошибка сервера при получении комментариев" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { publicationId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.userInfo.id;

    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ error: "Комментарий не может быть пустым" });
    }

    const q = `
      INSERT INTO comments (publication_id, user_id, content, parent_id, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, created_at
    `;

    const result = await query(q, [
      publicationId,
      userId,
      content,
      parentId || null,
    ]);
    const newComment = result.rows[0];

    return res.status(201).json({
      id: newComment.id,
      content: content,
      created_at: newComment.created_at,
      parent_id: parentId || null,
      likes_count: 0,
      is_liked: false,
      user: {
        id: userId,
        username: req.userInfo.username,
      },
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    return res
      .status(500)
      .json({ error: "Ошибка сервера при добавлении комментария" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userInfo.id;
    const userRole = req.userInfo.role;

    const checkQ = "SELECT user_id FROM comments WHERE id = $1";
    const checkRes = await query(checkQ, [commentId]);

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: "Комментарий не найден" });
    }

    if (checkRes.rows[0].user_id !== userId && userRole !== "admin") {
      return res.status(403).json({ error: "Нет прав на удаление" });
    }

    await query("DELETE FROM comments WHERE id = $1", [commentId]);

    return res.status(200).json({ message: "Комментарий удален" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    return res
      .status(500)
      .json({ error: "Ошибка сервера при удаления комментария" });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userInfo.id;

    const checkQ =
      "SELECT 1 FROM comment_likes WHERE user_id = $1 AND comment_id = $2";
    const checkRes = await query(checkQ, [userId, commentId]);

    let isLiked = false;

    if (checkRes.rows.length > 0) {
      await query(
        "DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2",
        [userId, commentId]
      );
      isLiked = false;
    } else {
      await query(
        "INSERT INTO comment_likes (user_id, comment_id) VALUES ($1, $2)",
        [userId, commentId]
      );
      isLiked = true;
    }

    const countRes = await query(
      "SELECT COUNT(*) FROM comment_likes WHERE comment_id = $1",
      [commentId]
    );
    const likesCount = parseInt(countRes.rows[0].count, 10);

    return res.status(200).json({ likesCount, isLiked });
  } catch (err) {
    console.error("Error toggling like:", err);
    return res.status(500).json({ error: "Ошибка сервера при лайке" });
  }
};
