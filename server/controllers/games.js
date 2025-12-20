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

    // { id, title, background_image }
    return res.json(rows);
  } catch (err) {
    console.error("Games search error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Новый эндпоинт для списка локальных игр с фильтрами
export const getLocalGames = async (req, res) => {
  try {
    const { 
      page = 1, 
      page_size = 30, 
      search, 
      genres, 
      platforms, 
      ordering, 
      rating_min 
    } = req.query;
    
    const offset = (page - 1) * page_size;
    let sqlQuery = "SELECT * FROM games WHERE 1=1";
    const params = [];
    let paramIndex = 1;
    
    // Фильтр по названию
    if (search) {
      sqlQuery += ` AND title ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Фильтр по рейтингу
    if (rating_min) {
      sqlQuery += ` AND rating >= $${paramIndex}`;
      params.push(parseFloat(rating_min));
      paramIndex++;
    }
    
    // Сортировка
    const validOrderings = {
      "rating": "rating DESC",
      "-rating": "rating ASC",
      "released": "released DESC",
      "-released": "released ASC",
      "title": "title ASC"
    };
    const orderBy = validOrderings[ordering] || "rating DESC";
    sqlQuery += ` ORDER BY ${orderBy}`;
    
    // Пагинация
    sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(page_size), offset);
    
    const games = await query(sqlQuery, params);
    
    // Подсчёт общего количества
    const countResult = await query("SELECT COUNT(*) as total FROM games WHERE 1=1");
    const total = countResult[0]?.total || 0;
    
    return res.status(200).json({
      count: total,
      results: games.map(g => ({
        slug: g.slug,
        title: g.title,
        background_image: g.background_image,
        rating: g.rating || 0,
        released: g.released,
        genres: JSON.parse(g.genres || "[]")
      }))
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }
};