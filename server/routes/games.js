import express from "express";
import { search } from "../controllers/games.js";

const router = express.Router();

// GET /api/games/search?q=...&limit=10
router.get("/search", search);

export default router;
