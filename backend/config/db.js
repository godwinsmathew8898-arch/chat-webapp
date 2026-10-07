import { MongoClient } from "mongodb";

let db;

export async function connectDB() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db("Chat-App");
  await db.collection("users").createIndex({ username: 1 }, { unique: true });

  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  console.log("MongoDB Connected");
}

export function getDB() {
  return db;
}
