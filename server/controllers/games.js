import { query } from "../db.js";
import axios from "axios";

const RAWG_KEY = process.env.API_KEY || process.env.APIKEY;
const RAWG_BASE = "https://api.rawg.io/api";

export const search = async (req, res) => {
  try {
    const rawQ = (req.query.q || "").trim();
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    if (rawQ.length < 2) {
      return res.json([]);
    }

    const escaped = rawQ.replace(/[%_]/g, (m) => `\\${m}`);
    const likeParam = `%${escaped}%`;
    const prefixParam = `${escaped}%`;

    const sql = `
      SELECT id, title, background_image
      FROM games
      WHERE title ILIKE $1
      ORDER BY
        (CASE WHEN LOWER(title) LIKE LOWER($2) THEN 0 ELSE 1 END),
        char_length(title) ASC
      LIMIT $3
    `;

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
      genres,
      dates,
      min_rating,
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
        g.release_date as released,
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

    if (genres) {
      const genreList = genres.split(",").map((g) => g.trim().toLowerCase());
      if (genreList.length > 0) {
        sql += ` AND EXISTS (
          SELECT 1 FROM game_genres gg_f 
          JOIN genres gr_f ON gg_f.genre_id = gr_f.id 
          WHERE gg_f.game_id = g.id 
          AND LOWER(gr_f.name) = ANY($${paramCount}::text[])
        )`;
        params.push(genreList);
        paramCount++;
      }
    }

    if (dates) {
      const [start, end] = dates.split(",");
      if (start && end) {
        sql += ` AND g.release_date BETWEEN $${paramCount} AND $${
          paramCount + 1
        }`;
        params.push(start, end);
        paramCount += 2;
      }
    }

    if (min_rating) {
      const ratingVal = parseFloat(min_rating);
      if (!isNaN(ratingVal)) {
        sql += ` AND g.rating >= $${paramCount}`;
        params.push(ratingVal);
        paramCount++;
      }
    }

    let orderBy = "g.created_at DESC";

    const field = ordering.startsWith("-") ? ordering.slice(1) : ordering;
    const direction = ordering.startsWith("-") ? "DESC" : "ASC";

    if (field === "name" || field === "title") orderBy = `g.title ${direction}`;
    else if (field === "rating") orderBy = `g.rating ${direction}`;
    else if (field === "released") orderBy = `g.release_date ${direction}`;
    else if (field === "created") orderBy = `g.created_at ${direction}`;

    sql += ` ORDER BY ${orderBy} NULLS LAST`;
    sql += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(pageSize, offset);

    let countSql = `SELECT COUNT(*) as total FROM games g WHERE 1=1`;
    const countParams = [];
    let countPCount = 1;

    if (searchTerm) {
      countSql += ` AND g.title ILIKE $${countPCount}`;
      countParams.push(`%${searchTerm}%`);
      countPCount++;
    }
    if (genres) {
      const genreList = genres.split(",").map((g) => g.trim().toLowerCase());
      if (genreList.length > 0) {
        countSql += ` AND EXISTS (
          SELECT 1 FROM game_genres gg_f 
          JOIN genres gr_f ON gg_f.genre_id = gr_f.id 
          WHERE gg_f.game_id = g.id 
          AND LOWER(gr_f.name) = ANY($${countPCount}::text[])
        )`;
        countParams.push(genreList);
        countPCount++;
      }
    }
    if (dates) {
      const [start, end] = dates.split(",");
      if (start && end) {
        countSql += ` AND g.release_date BETWEEN $${countPCount} AND $${
          countPCount + 1
        }`;
        countParams.push(start, end);
        countPCount += 2;
      }
    }
    if (min_rating) {
      const ratingVal = parseFloat(min_rating);
      if (!isNaN(ratingVal)) {
        countSql += ` AND g.rating >= $${countPCount}`;
        countParams.push(ratingVal);
        countPCount++;
      }
    }

    const { rows } = await query(sql, params);
    const countResult = await query(countSql, countParams);
    const totalCount = parseInt(countResult.rows[0].total, 10);

    const results = rows.map((game) => ({
      slug: game.slug || `game-${game.id}`,
      title: game.title,
      name: game.title,
      background_image: game.background_image || null,
      rating: parseFloat(game.rating) || 0,
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

export const getGameDetailsWithSync = async (req, res) => {
  const { slug } = req.params;

  try {
    const localGameQuery = `
      SELECT 
        g.id, g.title, g.slug, g.background_image, g.rating, g.release_date, 
        g.description, g.developers, g.publishers, g.created_at,
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', gr.id, 'name', gr.name))
            FROM game_genres gg
            JOIN genres gr ON gg.genre_id = gr.id
            WHERE gg.game_id = g.id
          ), '[]'
        ) as genres
      FROM games g
      WHERE g.slug = $1
      LIMIT 1
    `;

    const localResult = await query(localGameQuery, [slug]);

    if (localResult.rows.length > 0) {
      const game = localResult.rows[0];
      return res.status(200).json({
        id: game.id,
        slug: game.slug,
        title: game.title,
        name: game.title,
        description: game.description,
        background_image: game.background_image,
        rating: parseFloat(game.rating),
        released: game.release_date,
        genres: game.genres,
        developers: Array.isArray(game.developers) ? game.developers : [],
        publishers: Array.isArray(game.publishers) ? game.publishers : [],
        isLocal: true,
      });
    }

    if (!RAWG_KEY) {
      return res.status(500).json({ error: "RAWG API key is not configured" });
    }

    const rawgResponse = await axios.get(
      `${RAWG_BASE}/games/${encodeURIComponent(slug)}`,
      {
        params: { key: RAWG_KEY },
      }
    );
    const rawgData = rawgResponse.data;

    const title = rawgData.name;
    const description = rawgData.description_raw || rawgData.description || "";
    const developers = rawgData.developers?.map((d) => d.name) || [];
    const publishers = rawgData.publishers?.map((p) => p.name) || [];
    const releaseDate = rawgData.released || null;
    const backgroundImage = rawgData.background_image || null;

    const initialRating = 0;

    const insertGameSql = `
      INSERT INTO games (title, description, developers, publishers, slug, release_date, rating, background_image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    const insertResult = await query(insertGameSql, [
      title,
      description,
      developers,
      publishers,
      slug,
      releaseDate,
      initialRating,
      backgroundImage,
    ]);
    const newGameId = insertResult.rows[0].id;

    if (rawgData.genres && rawgData.genres.length > 0) {
      for (const g of rawgData.genres) {
        const genreSql = `
          INSERT INTO genres (name) VALUES ($1)
          ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `;
        const genreRes = await query(genreSql, [g.name]);
        const genreId = genreRes.rows[0].id;

        await query(
          `INSERT INTO game_genres (game_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [newGameId, genreId]
        );
      }
    }

    return res.status(200).json({
      id: newGameId,
      slug: slug,
      name: title,
      title: title,
      description: description,
      background_image: backgroundImage,
      rating: 0,
      released: releaseDate,
      genres: rawgData.genres || [],
      developers: rawgData?.developers || [],
      publishers: rawgData?.publishers || [],
      isLocal: false,
    });
  } catch (err) {
    console.error("Ошибка в getGameDetailsWithSync:", err.message);
    if (err.response) {
      return res
        .status(err.response.status)
        .json({ error: "Игра не найдена в RAWG API" });
    }
    return res.status(500).json({
      error: "Не удалось получить или сохранить данные игры",
      details: err.message,
    });
  }
};
