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
