import express from "express";
import {
  login,
  register,
  refreshAccessToken,
  logout,
} from "../Controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);

export default router;
