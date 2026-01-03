import express from "express";
import { addPublication } from "../controllers/publications.js";
import { verifyToken } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/", verifyToken, upload.single("file"), addPublication);

export default router;
