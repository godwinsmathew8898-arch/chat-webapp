import { MongoClient } from "mongodb";

let db;

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined");
  }

  const client = new MongoClient(mongoUri);

  await client.connect();

  db = client.db("Chat-App");

  console.log("MongoDB connected");
}

export function getDB() {
  if (!db) {
    throw new Error("Database not connected");
  }

  return db;
}
