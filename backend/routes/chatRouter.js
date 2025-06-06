import express from "express";
import {
  getOrCreateChat,
  sendMessage,
  markAsRead,
  getUserChats
} from "../controllers/chatController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", isAuthenticated, getUserChats);
router.get("/:applicationId", isAuthenticated, getOrCreateChat);
router.post("/:applicationId/message", isAuthenticated, sendMessage);
router.put("/:applicationId/read", isAuthenticated, markAsRead);

export default router;
