import {
  login,
  register,
  logout,
  getProfile,
  verifyToken,
  updateProfile,
  updateFavoriteGenres,
  getUserById,
  getFavoriteGenres,
} from "../controllers/auth.js";
import { Router } from "express";
import { upload } from "../middleware/upload.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/profile", verifyToken, getProfile);
router.get("/user/:id", getUserById);
router.get("/user/:id/genres", getFavoriteGenres);

router.put("/profile", verifyToken, upload.single("avatar"), updateProfile);
router.put("/profile/genres", verifyToken, updateFavoriteGenres);

export default router;
