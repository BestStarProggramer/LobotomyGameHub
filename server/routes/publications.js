import express from "express";
import {
  getPublications,
  getPublicationById,
  addPublication,
  updatePublication,
  deletePublication,
  toggleLike,
  incrementView,
} from "../controllers/publications.js";
import { verifyToken } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getPublications);
router.get("/:id", getPublicationById);
router.post("/", verifyToken, upload.single("file"), addPublication);
router.post("/:id/like", verifyToken, toggleLike);
router.post("/:id/view", incrementView);
router.put("/:id", verifyToken, upload.single("file"), updatePublication);
router.delete("/:id", verifyToken, deletePublication);

export default router;
