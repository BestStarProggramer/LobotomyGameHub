import express from "express";
import { Pool} from "pg";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";

dotenv.config();
const app = express();

// --- DATABASE CONNECTION ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Используем строку подключения из .env
});


// --- MIDDLEWARES ---
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// --- ROOT ---
app.get("/", (req, res) => {
  res.json({ message: "LobotomyGameHub API is running!" });
});
npm install dotenv
