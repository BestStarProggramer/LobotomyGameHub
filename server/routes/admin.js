import express from "express";
import { getAllUsers, toggleUserRole } from "../controllers/admin.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

const verifyAdmin = (req, res, next) => {
  if (req.userInfo && req.userInfo.role === "admin") {
    next();
  } else {
    return res.status(403).json({ error: "Доступ запрещен" });
  }
};

router.get("/users", verifyToken, verifyAdmin, getAllUsers);
router.post("/toggle-role", verifyToken, verifyAdmin, toggleUserRole);

export default router;
