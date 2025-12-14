import express from "express";
import { query } from "../db.js";

const PORT = process.env.PORT || 8800;

export const health = async (req, res) => {
  try {
    await query("SELECT 1");

    res.status(200).json({
      status: "ok",
      database: "connected",
      server: `running on port ${PORT}`,
    });
  } catch (error) {
    console.error(
      "[Health Check] Ошибка подключения к базе данных:",
      error.message
    );
    res.status(503).json({
      status: "error",
      database: "disconnected",
      server: `running on port ${PORT}`,
      message: "Database connection failed. Service Unavailable.",
    });
  }
};
