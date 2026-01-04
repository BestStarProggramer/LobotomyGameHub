import express from "express";
import { query } from "../db.js";

export const search = async (req, res) => {
  try {
    const rawQ = (req.query.q || "").trim();
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    if (rawQ.length < 2) {
      return res.json([]);
    }

    const escaped = rawQ.replace(/[%_]/g, (m) => `\\${m}`);
    const likeParam = `%${escaped}%`;

    const sql = `
      SELECT id, title, background_image
      FROM games
      WHERE title ILIKE $1
      ORDER BY
        (CASE WHEN LOWER(title) LIKE LOWER($2) THEN 0 ELSE 1 END),
        char_length(title) ASC
      LIMIT $3
    `;
    const prefixParam = `${escaped}%`;

    const { rows } = await query(sql, [likeParam, prefixParam, limit]);

    return res.status(200).json(rows);
  } catch (err) {
    console.error("Ошибка при поиске локальных игр:", err);
    return res.status(500).json({ error: "Ошибка сервера при поиске игр" });
  }
};

export const getLocalGames = async (req, res) => {
  try {
    const {
      page = 1,
      page_size = 30,
      search: searchTerm,
      ordering = "-created_at",
    } = req.query;

    const pageNum = parseInt(page, 10);
    const pageSize = Math.min(parseInt(page_size, 10), 50);
    const offset = (pageNum - 1) * pageSize;

    let sql = `
      SELECT 
        g.id, 
        g.title, 
        g.slug,
        g.background_image,
        g.rating,
        g.released,
        g.description,
        g.created_at,
        (
          SELECT json_agg(json_build_object('id', gr.id, 'name', gr.name))
          FROM game_genres gg
          JOIN genres gr ON gg.genre_id = gr.id
          WHERE gg.game_id = g.id
        ) as genres
      FROM games g
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (searchTerm) {
      sql += ` AND g.title ILIKE $${paramCount}`;
      params.push(`%${searchTerm}%`);
      paramCount++;
    }

    let orderBy = "g.created_at DESC";
    if (ordering === "title") orderBy = "g.title ASC";
    if (ordering === "-title") orderBy = "g.title DESC";
    if (ordering === "rating") orderBy = "g.rating ASC";
    if (ordering === "-rating") orderBy = "g.rating DESC";
    if (ordering === "released") orderBy = "g.released ASC";
    if (ordering === "-released") orderBy = "g.released DESC";

    sql += ` ORDER BY ${orderBy}`;

    sql += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(pageSize, offset);

    let countSql = `SELECT COUNT(*) as total FROM games g WHERE 1=1`;
    if (searchTerm) {
      countSql += ` AND g.title ILIKE $1`;
    }

    const { rows } = await query(sql, params);
    const countParams = searchTerm ? [`%${searchTerm}%`] : [];
    const countResult = await query(countSql, countParams);
    const totalCount = parseInt(countResult.rows[0].total, 10);

    const results = rows.map((game) => ({
      slug: game.slug || `game-${game.id}`,
      name: game.title,
      background_image: game.background_image || null,
      rating: game.rating || 0,
      released: game.released || null,
      description: game.description || "",
      genres: (game.genres || []).map((g) => ({ id: g.id, name: g.name })),
    }));

    return res.status(200).json({
      count: totalCount,
      next: pageNum * pageSize < totalCount ? pageNum + 1 : null,
      previous: pageNum > 1 ? pageNum - 1 : null,
      results: results,
    });
  } catch (err) {
    console.error("Ошибка при получении локальных игр:", err);
    return res.status(500).json({
      error: "Ошибка сервера при получении игр",
      details: err.message,
    });
  }
};

export const getLocalGameDetails = async (req, res) => {
  try {
    const { slugOrId } = req.params;

    const isNumeric = !isNaN(slugOrId) && !isNaN(parseFloat(slugOrId));

    const whereClause = isNumeric
      ? "g.id = $1"
      : "g.slug = $1 OR LOWER(g.title) = LOWER($1)";

    const sql = `
      SELECT 
        g.id,
        g.title,
        g.slug,
        g.background_image,
        g.rating,
        g.released,
        g.description,
        g.developers,
        g.publishers,
        g.website,
        g.metacritic_score,
        g.created_at,
        (
          SELECT json_agg(json_build_object('id', gr.id, 'name', gr.name))
          FROM game_genres gg
          JOIN genres gr ON gg.genre_id = gr.id
          WHERE gg.game_id = g.id
        ) as genres
      FROM games g
      WHERE ${whereClause}
      LIMIT 1
    `;

    const { rows } = await query(sql, [slugOrId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Игра не найдена" });
    }

    const game = rows[0];

    const response = {
      id: game.id,
      slug: game.slug || `game-${game.id}`,
      name: game.title,
      description_raw: game.description || "",
      description: game.description || "",
      background_image: game.background_image || null,
      rating: game.rating || 0,
      released: game.released || null,
      developers: game.developers ? JSON.parse(game.developers) : [],
      publishers: game.publishers ? JSON.parse(game.publishers) : [],
      website: game.website || "",
      metacritic: game.metacritic_score || null,
      genres: (game.genres || []).map((g) => ({ id: g.id, name: g.name })),
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error("Ошибка при получении деталей игры:", err);
    return res.status(500).json({
      error: "Ошибка сервера при получении деталей игры",
      details: err.message,
    });
  }
};
