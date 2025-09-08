import express from "express";
import { authMiddleware } from "../middleware/auth-middleware.js";
import {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  getHistory,
} from "../controllers/user-controller.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.patch("/password", authMiddleware, updatePassword);
router.get("/history", authMiddleware, getHistory);

export default router;
