import { query } from "../db.js";

export const addReview = async (req, res) => {
  try {
    const userId = req.userInfo?.id;
    const { gameId } = req.params;
    const { rating, content } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!gameId) return res.status(400).json({ error: "gameId is required" });
    if (!content || typeof content !== "string" || content.trim().length === 0)
      return res.status(400).json({ error: "content is required" });
    if (!rating || isNaN(rating) || rating < 1 || rating > 5)
      return res.status(400).json({ error: "rating must be 1..5" });

    const q = `
      INSERT INTO reviews (user_id, game_id, rating, content, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, created_at
    `;
    const values = [
      userId,
      parseInt(gameId, 10),
      parseInt(rating, 10),
      content.trim(),
    ];
    const result = await query(q, values);

    return res.status(201).json({
      id: result.rows[0].id,
      created_at: result.rows[0].created_at,
      message: "Review created",
    });
  } catch (err) {
    console.error("addReview error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getReviewsByGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const limit = Math.min(parseInt(req.query.limit || "5", 10), 100);
    const offset = Math.max(parseInt(req.query.offset || "0", 10), 0);

    if (!gameId) return res.status(400).json({ error: "gameId is required" });

    const q = `
      SELECT r.id, r.rating, r.content, r.created_at,
             u.id as user_id, u.username, COALESCE(u.avatar_url, '/img/default-avatar.jpg') as avatar_url
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.game_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const { rows } = await query(q, [parseInt(gameId, 10), limit, offset]);

    const reviews = rows.map((r) => ({
      id: r.id,
      username: r.username,
      user_id: r.user_id,
      avatar: r.avatar_url,
      rating: r.rating,
      content: r.content,
      created_at: r.created_at,
    }));

    return res.status(200).json(reviews);
  } catch (err) {
    console.error("getReviewsByGame error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const userId = req.userInfo?.id;
    const { gameId, reviewId } = req.params;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!reviewId) return res.status(400).json({ error: "reviewId required" });

    const check = await query(
      "SELECT user_id FROM reviews WHERE id = $1 LIMIT 1",
      [parseInt(reviewId, 10)]
    );
    if (check.rows.length === 0)
      return res.status(404).json({ error: "Review not found" });

    if (parseInt(check.rows[0].user_id, 10) !== parseInt(userId, 10)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await query("DELETE FROM reviews WHERE id = $1", [parseInt(reviewId, 10)]);
    return res.status(200).json({ message: "Review deleted" });
  } catch (err) {
    console.error("deleteReview error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const pageSize = Math.min(parseInt(req.query.page_size || "30", 10), 100);
    const offset = (page - 1) * pageSize;

    const q = `
      SELECT r.id, r.rating, r.content, r.created_at,
             u.id as user_id, u.username, COALESCE(u.avatar_url, '/img/default-avatar.jpg') as avatar_url,
             g.id as game_id, g.title as game_title
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN games g ON r.game_id = g.id
      ORDER BY r.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const { rows } = await query(q, [pageSize, offset]);

    const reviews = rows.map((r) => ({
      id: r.id,
      username: r.username,
      user_id: r.user_id,
      avatar: r.avatar_url,
      rating: r.rating,
      content: r.content,
      created_at: r.created_at,
      game: {
        id: r.game_id,
        title: r.game_title,
      },
    }));

    return res.status(200).json({ page, pageSize, results: reviews });
  } catch (err) {
    console.error("getAllReviews error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = Math.min(parseInt(req.query.limit || "5", 10), 100);
    const offset = Math.max(parseInt(req.query.offset || "0", 10), 0);

    const userCheck = await query("SELECT id FROM users WHERE id = $1", [
      parseInt(userId, 10),
    ]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const q = `
      SELECT r.id, r.rating, r.content, r.created_at,
             g.id as game_id, g.title as game_title, g.slug as game_slug, 
             g.background_image as game_image,
             u.id as user_id, u.username, COALESCE(u.avatar_url, '/img/default-avatar.jpg') as avatar
      FROM reviews r
      JOIN games g ON r.game_id = g.id
      JOIN users u ON r.user_id = u.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const { rows } = await query(q, [parseInt(userId, 10), limit, offset]);

    const reviews = rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      content: r.content,
      created_at: r.created_at,
      user_id: r.user_id,
      username: r.username,
      avatar: r.avatar,

      game: {
        id: r.game_id,
        title: r.game_title,
        slug: r.game_slug,
        image: r.game_image || "/img/default.jpg",
      },
    }));

    return res.status(200).json(reviews);
  } catch (err) {
    console.error("getReviewsByUser error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
