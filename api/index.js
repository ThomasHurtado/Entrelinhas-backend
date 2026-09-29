import "dotenv/config";
import mongoose from "mongoose";
import app from "../src/app.js";
import { connectDatabase } from "../src/config/db.js";

let connectionPromise = null;

async function ensureDatabaseConnection() {
  if (mongoose.connection.readyState === 1) return;

  if (!connectionPromise) {
    connectionPromise = connectDatabase().catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;
}

export default async function handler(req, res) {
  // O health check continua respondendo mesmo se o MongoDB estiver fora do ar.
  if (req.url === "/api/health" || req.url === "/api/health/") {
    return app(req, res);
  }

  try {
    await ensureDatabaseConnection();
    return app(req, res);
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error.message);
    return res.status(503).json({
      message: "Não foi possível conectar ao banco de dados.",
    });
  }
}
