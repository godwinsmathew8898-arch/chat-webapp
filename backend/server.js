import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import userRoutes from "./Router/userRouter.js";
import messageRoutes from "./Router/messageRoutes.js";
import authRouter from "./Router/authRouter.js";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.use("/api/users/",userRoutes)
app.use("/api/messages/",messageRoutes)
app.use("/api/auth", authRouter);



// ==================================
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
