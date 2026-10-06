import { MongoClient } from "mongodb";

let db;

export async function connectDB() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db("Chat-App");
  console.log("MongoDB Connected");
}

export function getDB() {
  return db;
}
