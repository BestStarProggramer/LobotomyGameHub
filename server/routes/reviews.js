import express from "express";
import {
  addReview,
  getReviewsByGame,
  getAllReviews,
} from "../controllers/reviews.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/reviews -> all reviews (paginated)
router.get("/", getAllReviews);

// GET /api/reviews/game/:gameId -> recent reviews for a game (query ?limit=5)
router.get("/game/:gameId", getReviewsByGame);

// POST /api/reviews/game/:gameId -> create review (authorized)
router.post("/game/:gameId", verifyToken, addReview);

export default router;
