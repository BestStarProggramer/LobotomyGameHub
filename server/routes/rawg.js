import {
  getGames,
  getGameBySlug,
  getScreenshotsBySlug,
} from "../controllers/rawg.js";
import { Router } from "express";

const router = Router();

router.get("/games", getGames);
router.get("/games/:slug", getGameBySlug);
router.get("/games/:slug/screenshots", getScreenshotsBySlug);

export default router;
