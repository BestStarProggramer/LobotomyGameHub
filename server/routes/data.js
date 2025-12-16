import express from "express";
import { getAllGenres } from "../controllers/data.js";

const router = express.Router();

router.get("/genres", getAllGenres);

export default router;
