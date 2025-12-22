import express from "express";
import axios from "axios";

const RAWG_KEY = process.env.APIKEY || process.env.API_KEY;
const RAWG_BASE = "https://api.rawg.io/api";

export const getGames = async (req, res) => {
  try {
    const {
      page = 1,
      page_size = 30, // По умолчанию 30 игр
      search,
      genres, // Жанры (через запятую)
      platforms, // Платформы
      ordering, // Сортировка (rating, -rating, released, -released)
      dates, // Даты релиза (2020-01-01,2024-12-31)
    } = req.query;

    if (!RAWG_KEY) {
      return res.status(500).json({ error: "RAWG API key is not configured" });
    }

    const params = { key: RAWG_KEY, page, page_size };

    if (search) params.search = search;
    if (genres) params.genres = genres;
    if (platforms) params.platforms = platforms;
    if (ordering) params.ordering = ordering;
    if (dates) params.dates = dates;

    const response = await axios.get(`${RAWG_BASE}/games`, { params });
    res.json(response.data);
  } catch (error) {
    console.error("RAWG API error:", error.message);
    res.status(500).json({ error: "Failed to fetch from RAWG API" });
  }
};

export const getGameBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;

    if (!slug) {
      return res.status(400).json({ error: "Slug параметр обязателен" });
    }

    if (!RAWG_KEY) {
      return res.status(500).json({ error: "RAWG API key is not configured" });
    }

    console.log(`Запрос к RAWG API для игры: ${slug}`);

    const response = await axios.get(
      `${RAWG_BASE}/games/${encodeURIComponent(slug)}`,
      { params: { key: RAWG_KEY } }
    );

    res.json(response.data);
  } catch (error) {
    console.error(`RAWG API error для ${req.params.slug}:`, error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data?.detail || "Игра не найдена в RAWG API",
      });
    }

    res.status(500).json({ error: "Ошибка при запросе к RAWG API" });
  }
};

export const getScreenshotsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!RAWG_KEY) {
      return res.status(500).json({ error: "RAWG API key is not configured" });
    }

    const response = await axios.get(
      `${RAWG_BASE}/games/${encodeURIComponent(slug)}/screenshots`,
      { params: { key: RAWG_KEY } }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Ошибка при проксировании screenshots RAWG API:", error.message);
    res.status(500).json({ error: "Failed to fetch game screenshots from RAWG API" });
  }
};

export const getTrailersBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!RAWG_KEY) {
      return res.status(500).json({ error: "RAWG API key is not configured" });
    }

    const response = await axios.get(
      `${RAWG_BASE}/games/${encodeURIComponent(slug)}/movies`,
      { params: { key: RAWG_KEY } }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Ошибка при проксировании movies RAWG API:", error.message);
    res.status(500).json({ error: "Failed to fetch game trailers from RAWG API" });
  }
};
