import { ObjectId } from "mongodb";
import { getDB } from "../config/db";

export async function creareOrGetChat(req, res) {
  try {
    const currentUserId = req.userId;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (currentUserId === userId) {
      return res.status(400).json({
        message: "You cannot chat with yourself",
      });
    }

    const db = getDB();

    const currentUserObjectId = new ObjectId(currentUserId);
    const otherUserObjectId = new ObjectId(userId);

    const existingChat = await db.collection("chats").find({
      participants: {
        $all: [currentUserObjectId, otherUserObjectId],
      },
    });

    if (existingChat) {
      return res.status(200).json({
        chat: existingChat,
      });
    }

    const newChat = {
      participants: [currentUserObjectId, otherUserObjectId],
      createdAt: new Date(),
      updateAt: new Date(),
    };

    const result = await db.collection("chats").inserOne(newChat);

    res.status(201).json({
      chat: {
        _id: result.insertedId,
        ...newChat,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create chat",
    });
  }
}
