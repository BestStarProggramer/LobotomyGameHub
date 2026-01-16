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
        c.updated_at,
        c.is_edited,
        c.parent_id,
        c.likes as likes_count,
        u.id as user_id, 
        u.username, 
        u.role,
        u.avatar_url,
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
      updated_at: row.updated_at,
      is_edited: row.is_edited,
      parent_id: row.parent_id,
      likes_count: parseInt(row.likes_count, 10) || 0,
      is_liked: row.is_liked,
      user: {
        id: row.user_id,
        username: row.username,
        role: row.role,
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
    let { content, parentId } = req.body;
    const userId = req.userInfo.id;
    const userRole = req.userInfo.role;

    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ error: "Комментарий не может быть пустым" });
    }

    if (parentId) {
      const parentDataQ = `
        WITH RECURSIVE parents AS (
            SELECT id, parent_id, user_id, 0 as level
            FROM comments
            WHERE id = $1
            UNION ALL
            SELECT c.id, c.parent_id, c.user_id, p.level + 1
            FROM comments c
            INNER JOIN parents p ON c.id = p.parent_id
        )
        SELECT p.level, u.username, p.parent_id as real_parent_id
        FROM parents p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = $1
      `;

      const parentRes = await query(parentDataQ, [parentId]);

      if (parentRes.rows.length > 0) {
        const parentDepth = parseInt(parentRes.rows[0].level, 10);

        if (parentDepth >= 2) {
          parentId = parentRes.rows[0].real_parent_id;

          const tag = `@${parentRes.rows[0].username}, `;
          if (!content.startsWith("@")) {
            content = `${tag} ${content}`;
          }
        }
      }
    }

    const q = `
      INSERT INTO comments (publication_id, user_id, content, parent_id, created_at, likes, is_edited)
      VALUES ($1, $2, $3, $4, NOW(), 0, FALSE)
      RETURNING id, created_at, likes
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
      updated_at: newComment.created_at,
      is_edited: false,
      parent_id: parentId || null,
      likes_count: 0,
      is_liked: false,
      user: {
        id: userId,
        username: req.userInfo.username,
        role: userRole,
        avatar: req.userInfo.avatar_url,
      },
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    return res
      .status(500)
      .json({ error: "Ошибка сервера при добавлении комментария" });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.userInfo.id;

    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ error: "Комментарий не может быть пустым" });
    }

    const checkQ = "SELECT user_id FROM comments WHERE id = $1";
    const checkRes = await query(checkQ, [commentId]);

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: "Комментарий не найден" });
    }

    if (checkRes.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "Нет прав на редактирование" });
    }

    const updateQ = `
      UPDATE comments 
      SET content = $1, is_edited = TRUE, updated_at = NOW() 
      WHERE id = $2 
      RETURNING updated_at, is_edited
    `;
    const updateRes = await query(updateQ, [content.trim(), commentId]);

    return res.status(200).json(updateRes.rows[0]);
  } catch (err) {
    console.error("Error updating comment:", err);
    return res
      .status(500)
      .json({ error: "Ошибка сервера при обновлении комментария" });
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

    const cId = parseInt(commentId, 10);
    const uId = parseInt(userId, 10);

    if (isNaN(cId))
      return res.status(400).json({ error: "Invalid comment ID" });

    const checkQ =
      "SELECT 1 FROM comment_likes WHERE user_id = $1 AND comment_id = $2";
    const checkRes = await query(checkQ, [uId, cId]);

    let isLiked = false;
    let likesCount = 0;

    if (checkRes.rows.length > 0) {
      await query(
        "DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2",
        [uId, cId]
      );

      const updateQ = `UPDATE comments SET likes = likes - 1 WHERE id = $1 RETURNING likes`;
      const updateRes = await query(updateQ, [cId]);

      likesCount = updateRes.rows[0].likes;
      isLiked = false;
    } else {
      await query(
        `INSERT INTO comment_likes (user_id, comment_id) VALUES ($1, $2)`,
        [uId, cId]
      );

      const updateQ = `UPDATE comments SET likes = likes + 1 WHERE id = $1 RETURNING likes`;
      const updateRes = await query(updateQ, [cId]);

      likesCount = updateRes.rows[0].likes;
      isLiked = true;
    }

    return res.status(200).json({ likesCount, isLiked });
  } catch (err) {
    console.error("Error toggling like:", err);
    return res.status(500).json({ error: "Ошибка сервера при лайке" });
  }
};
