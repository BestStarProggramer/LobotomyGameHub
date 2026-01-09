import {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
  verifyOldEmail,
  verifyOldEmailCode,
  changeEmail,
  getProfile,
  verifyToken,
  updateProfile,
  updateFavoriteGenres,
  getUserById,
  getFavoriteGenres,
} from "../controllers/auth.js";
import { Router } from "express";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-old-email", verifyOldEmail);
router.post("/verify-old-email-code", verifyOldEmailCode);
router.post("/change-email", changeEmail);

router.get("/profile", verifyToken, getProfile);
router.get("/user/:id", getUserById);
router.get("/user/:id/genres", getFavoriteGenres);

router.put("/profile", verifyToken, updateProfile);
router.put("/profile/genres", verifyToken, updateFavoriteGenres);

export default router;
