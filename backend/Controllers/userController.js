import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export async function searchUsers(req, res) {
  try {
    const { username } = req.query;
    const currentUserId = req.userId;
    if (!username || username.trim().length < 1) {
      return res.status(400).json({
        message: "Enter username",
      });
    }
    const db = getDB();
    const users = await db
      .collection("users")
      .find(
        {
          _id: { $ne: new ObjectId(currentUserId) },
          username: {
            $regex: username.trim(),
            $options: "i",
          },
        },
        {
          projection: {
            username: 1,
          },
        },
      )
      .limit(10)
      .toArray();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to search users",
    });
  }
}
