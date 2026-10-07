import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

import { connectDB } from "./config/db.js";
import userRoutes from "./Router/userRouter.js";
import messageRoutes from "./Router/messageRoutes.js";
import authRouter from "./Router/authRouter.js";
import chatRoutes from "./Router/chatRoutes.js";

const app = express();

const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRouter);
app.use("/api/chats", chatRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

async function startServer() {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`app listening on port ${port}`);
    });
  } catch (error) {
    console.log("Failed to start Server!");
  }
}

startServer();
