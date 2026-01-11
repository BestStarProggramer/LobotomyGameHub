import express from "express";
import {
  getComments,
  addComment,
  deleteComment,
  toggleLike,
} from "../controllers/comments.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/:publicationId",
  (req, res, next) => {
    const token = req.cookies?.accessToken;
    if (token) {
      verifyToken(req, res, next);
    } else {
      next();
    }
  },
  getComments
);

router.post("/:publicationId", verifyToken, addComment);

router.delete("/:commentId", verifyToken, deleteComment);

router.post("/:commentId/like", verifyToken, toggleLike);

export default router;
