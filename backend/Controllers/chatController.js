import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

export async function createOrGetChat(req, res) {
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

    const existingChat = await db.collection("chats").findOne({
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
      updatedAt: new Date(),
    };

    const result = await db.collection("chats").insertOne(newChat);

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

export async function getChats(req, res) {
  try {
    const currentUserId = new ObjectId(req.userId);

    const db = getDB();

    const chats = await db
      .collection("chats")
      .aggregate([
        {
          $match: {
            participants: currentUserId,
          },
        },

        {
          $sort: {
            updatedAt: -1,
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "participants",
            foreignField: "_id",
            as: "participantUsers",
          },
        },

        {
          $project: {
            createdAt: 1,
            updatedAt: 1,

            participantUsers: {
              $map: {
                input: "$participantUsers",
                as: "user",
                in: {
                  _id: "$$user._id",
                  username: "$$user.username",
                },
              },
            },
          },
        },
      ])
      .toArray();

    res.status(200).json({
      chats,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch chats",
    });
  }
}
