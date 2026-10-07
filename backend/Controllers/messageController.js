import { getDB } from "../config/db.js";

export async function sendMessage(req, res) {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.userId;
    if (senderId || !receiverId || !content) {
      return res.status(400).json({
        message: "senderId, receiverId and content are required",
      });
    }
    const db = getDB();
    const newMessage = {
      senderId,
      receiverId,
      content,
      createdAt: new Date(),
    };
    const result = await db.collection("messages").insertOne(newMessage);
    res.status(201).json({
      message: {
        _id: result.insertedId,
        ...newMessage,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to send message",
    });
  }
}

export async function getMessages(req, res) {
  try {
    const { receiverId } = req.params;
    const { senderId } = req.query;
    if (!senderId) {
      return res.status(400).json({
        message: "senderId is required!",
      });
    }
    const db = getDB();
    const messages = await db
      .collection("messages")
      .find({
        $or: [
          {
            senderId,
            receiverId,
          },
          {
            senderId: receiverId,
            receiverId: senderId,
          },
        ],
      })
      .sort({ createdAt: 1 })
      .toArray();
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch messages!",
    });
  }
}
