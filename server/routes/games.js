import express from "express";
import {
  search,
  getLocalGames,
  getGameDetailsWithSync,
  getHomeData,
} from "../controllers/games.js";
import { checkAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/home", checkAuth, getHomeData);
router.get("/search", search);
router.get("/local", getLocalGames);
router.get("/details/:slug", getGameDetailsWithSync);

export default router;
