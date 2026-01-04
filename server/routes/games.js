import express from "express";
import {
  search,
  getLocalGames,
  getGameDetailsWithSync,
} from "../controllers/games.js";

const router = express.Router();

// GET /api/games/search?q=...&limit=10
router.get("/search", search);

// GET /api/games/local?page=1&page_size=30&search=...
router.get("/local", getLocalGames);

// GET /api/games/details/:slug
router.get("/details/:slug", getGameDetailsWithSync);

export default router;
