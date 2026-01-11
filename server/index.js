import express from "express";
import cors from "cors";
import "dotenv/config";
import authRouter from "./routes/auth.js";
import gamesRouter from "./routes/games.js";
import rawgRouter from "./routes/rawg.js";
import dataRouter from "./routes/data.js";
import healthRouter from "./routes/health.js";
import cookieParser from "cookie-parser";
import gamesRoutes from "./routes/games.js";
import publicationsRouter from "./routes/publications.js";
import reviewsRouter from "./routes/reviews.js";
import commentsRouter from "./routes/comments.js";

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

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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
app.use("/api/reviews", reviewsRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/publications", publicationsRouter);
app.use("/api/games", gamesRoutes);

app.listen(PORT, () => {
  console.log(
    `[Server] HTTP backend server is running on http://localhost:${PORT}`
  );
});
