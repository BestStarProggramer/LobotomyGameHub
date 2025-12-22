import {
  getGames,
  getGameBySlug,
  getScreenshotsBySlug,
  getTrailersBySlug,
} from "../controllers/rawg.js";
import { Router } from "express";

const router = Router();

router.get("/games", getGames);
router.get("/games/:slug", getGameBySlug);
router.get("/games/:slug/screenshots", getScreenshotsBySlug);
router.get("/games/:slug/trailers", getTrailersBySlug);

export default router;
