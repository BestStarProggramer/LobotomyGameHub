import express from "express";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/admin.js";
import { verifyToken, verifyDashboardAccess } from "../middleware/auth.js";

const router = express.Router();

router.get("/users", verifyToken, verifyDashboardAccess, getAllUsers);
router.post("/update-role", verifyToken, verifyDashboardAccess, updateUserRole);
router.delete("/users/:userId", verifyToken, verifyDashboardAccess, deleteUser);

export default router;
