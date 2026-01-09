import express from "express";
import {
  addReview,
  getReviewsByGame,
  getAllReviews,
  deleteReview,
  getReviewsByUser,
} from "../controllers/reviews.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllReviews);

router.get("/game/:gameId", getReviewsByGame);

router.post("/game/:gameId", verifyToken, addReview);

router.delete("/game/:gameId/:reviewId", verifyToken, deleteReview);

router.get("/user/:userId", getReviewsByUser);

export default router;
