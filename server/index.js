import express from "express";
import cors from "cors";
import "dotenv/config";
import { query } from "./db.js";
import authRouter from "./routes/auth.js";
import gamesRouter from "./routes/games.js";
import rawgRouter from "./routes/rawg.js";
import dataRouter from "./routes/data.js";
import healthRouter from "./routes/health.js";
import cookieParser from "cookie-parser";
import gamesRoutes from "./routes/games.js"
import https from "https";
import fs from "fs";
import axios from "axios";

const RAWG_BASE = "https://api.rawg.io/api";
const RAWG_KEY = process.env.API_KEY;

const app = express();
const PORT = process.env.PORT || 8800;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use("/api/auth", authRouter);
app.use("/api/games", gamesRouter);
app.use("/api/rawg", rawgRouter);
app.use("/api/data", dataRouter);
app.use("/api/health", healthRouter);
app.use("/api/games",gamesRoutes)

app.listen(PORT, () => {
  console.log(
    `[Server] HTTP backend server is running on http://localhost:${PORT}`
  );
});
