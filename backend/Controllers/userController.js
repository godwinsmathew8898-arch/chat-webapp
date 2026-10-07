import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export async function getUsers(req, res) {
  try {
    const db = getDB();
    const users = await db
      .collection("users")
      .find(
        {
          _id: { $ne: new ObjectId(req.userId) },
        },
        {
          projection: {
            password: 0,
          },
        },
      )
      .toArray();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
}
