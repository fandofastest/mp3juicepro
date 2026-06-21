import mongoose from "mongoose";
import { Logger } from "@headless/utils";

export * from "./schemas.js";
export * from "./seed.js";

let isConnected = false;

export async function connectToDatabase(uri?: string) {
  if (isConnected) {
    return;
  }

  const mongoUri = uri || process.env.MONGODB_URI || "mongodb://localhost:27017/mp3juice";

  try {
    const db = await mongoose.connect(mongoUri, {
      autoIndex: true,
    });
    isConnected = db.connections[0].readyState === 1;
    Logger.info("Database connected successfully.");
  } catch (error) {
    Logger.error("Failed to connect to database:", error);
    throw error;
  }
}

export async function disconnectFromDatabase() {
  if (!isConnected) return;
  try {
    await mongoose.disconnect();
    isConnected = false;
    Logger.info("Database disconnected successfully.");
  } catch (error) {
    Logger.error("Error disconnecting from database:", error);
  }
}
