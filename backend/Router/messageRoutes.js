import express from "express"
import { sendMessage,getMessages } from "../Controllers/messageController.js"
import { authenticateToken } from "../middleware/authMiddleware.js";

const router=express.Router()

router.post("/",authenticateToken,sendMessage)
router.get("/:receiverId",getMessages)

export default router