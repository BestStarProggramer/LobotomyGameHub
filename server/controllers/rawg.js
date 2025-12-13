import express from "express";
import axios from "axios";

const RAWG_KEY = process.env.API_KEY;
const RAWG_BASE = "https://api.rawg.io/api";

export const getGames = async (req, res) => {
  try {
    const { page = 1, page_size = 20, search = "" } = req.query;

    const params = {
      key: RAWG_KEY,
      page,
      page_size,
    };

    if (search) {
      params.search = search;
    }

    const response = await axios.get(`${RAWG_BASE}/games`, { params });

    res.json(response.data);
  } catch (error) {
    console.error("Ошибка при проксировании RAWG API:", error.message);
    res.status(500).json({ error: "Failed to fetch from RAWG API" });
  }
};

export const getGameBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const response = await axios.get(
      `${RAWG_BASE}/games/${encodeURIComponent(slug)}`,
      {
        params: { key: RAWG_KEY },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Ошибка при проксировании details RAWG API:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch game details from RAWG API" });
  }
};

export const getScreenshotsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const response = await axios.get(
      `${RAWG_BASE}/games/${encodeURIComponent(slug)}/screenshots`,
      { params: { key: RAWG_KEY } }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "Ошибка при проксировании screenshots RAWG API:",
      error.message
    );
    res
      .status(500)
      .json({ error: "Failed to fetch game screenshots from RAWG API" });
  }
};
