import express from "express";
import { health } from "../controllers/health.js";

const router = express.Router();

// GET /api/health
router.get("/", health);

export default router;
