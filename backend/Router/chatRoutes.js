import express from "express";
import { createOrGetChat, getChats } from "../Controllers/chatController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, createOrGetChat);
router.get("/", authenticateToken, getChats);

export default router;
