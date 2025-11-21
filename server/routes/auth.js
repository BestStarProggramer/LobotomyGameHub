import { login, register, logout } from "../controllers/auth.js";
import { Router } from "express";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

export default router;
