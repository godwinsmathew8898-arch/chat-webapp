import express from "express";
import { getUsers } from "../Controllers/userController.js";

const router = express.router();

router.get("/", getUsers);

export default router;
