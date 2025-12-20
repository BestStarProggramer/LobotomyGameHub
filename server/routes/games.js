import express from "express";
import { search } from "../controllers/games.js";

const router = express.Router();

// GET /api/games/search?q=...&limit=10
router.get("/search", search);

// Список игр из локальной БД с фильтрами/пагинацией
// GET /api/games/local?page=1&page_size=30&search=...
router.get("/local", getLocalGames);

export default router;
