import express from "express";
import {
  login,
  register,
  refreshAccessToken,
} from "../Controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refresh", refreshAccessToken);

export default router;
