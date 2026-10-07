import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getDB } from "../config/db.js";
import { createAccessToken, createRefreshToken } from "../utils/token.js";
import { ObjectId } from "mongodb";

function refreshCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const db = getDB();

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const userId = user._id.toString();
    const accessToken = createAccessToken(userId);

    const refreshToken = createRefreshToken(userId);
    res.cookie("refreshToken", refreshToken, {
      ...refreshCookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      accessToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed",
    });
  }
}

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email and password are required",
      });
    }

    const db = getDB();

    const existingUser = await db
      .collection("users")
      .findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.status(409).json({
        message: "Username or email is already taken!",
      });
    }
    const normalizedUsername = username.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      username: normalizedUsername,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    const userId = result.insertedId.toString();
    const accessToken = createAccessToken(userId);

    const refreshToken = createRefreshToken(userId);
    res.cookie("refreshToken", refreshToken, {
      ...refreshCookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      accessToken,
      user: {
        _id: result.insertedId,
        username,
        email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
}

export async function refreshAccessToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh Token missing",
      });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const db = getDB();
    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    });
    if (!user) {
      return res.status(401).json({
        message: "user not foudn!",
      });
    }
    const accessToken = createAccessToken(user._id.toString());
    res.status(200).json({
      accessToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
}

export async function logout(req, res) {
  res.clearCookie("refreshToken", refreshCookieOptions());
  res.status(200).json({
    message: "Logged out succesfully!",
  });
}
