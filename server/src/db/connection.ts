import mongoose from "mongoose";

/**
 * Connects to MongoDB using MONGODB_URI + MONGODB_DATABASE.
 * Exits the process on failure so a broken DB connection never
 * silently serves an app with no data.
 */
export async function connectToDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DATABASE || "ride_sharing_db";

  if (!uri) {
    throw new Error("MONGODB_URI is not set. Copy .env.example to .env and configure it.");
  }

  mongoose.connection.on("connected", () => {
    console.log(`[db] connected -> ${dbName}`);
  });
  mongoose.connection.on("error", (err) => {
    console.error("[db] connection error:", err.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("[db] disconnected");
  });

  await mongoose.connect(uri, { dbName });
}

export async function disconnectFromDatabase(): Promise<void> {
  await mongoose.disconnect();
}
