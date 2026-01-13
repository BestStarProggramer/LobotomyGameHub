import express from "express";
import {
  getPublications,
  getPublicationById,
  addPublication,
  updatePublication,
  deletePublication,
  toggleLike,
  incrementView,
  uploadPublicationImage,
} from "../controllers/publications.js";
import { verifyToken } from "../middleware/auth.js";
import { checkAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getPublications);

router.get("/:id", checkAuth, getPublicationById);

router.post(
  "/upload-image",
  verifyToken,
  upload.single("file"),
  uploadPublicationImage
);

router.post("/", verifyToken, upload.single("file"), addPublication);
router.post("/:id/like", verifyToken, toggleLike);
router.post("/:id/view", checkAuth, incrementView);
router.put("/:id", verifyToken, upload.single("file"), updatePublication);
router.delete("/:id", verifyToken, deletePublication);

export default router;
