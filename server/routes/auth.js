import {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
  verifyOldEmail,
  verifyOldEmailCode,
  changeEmail,
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

export default router;
