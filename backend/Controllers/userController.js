import { getDB } from "../config/db";

export async function getUsers(req, res) {
  try {
    const db = getDB();
    const users = db.collection("users").find({}).toArray();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
}

