import express from "express";
import { multerMiddleware } from "../config/cloudnaryConfig.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  deleteMessage,
  getConversation,
  getMessages,
  markAsRead,
  sendMessage,
} from "../controllers/chatController.js";

const router = express.Router();
router.post("/sendMessages", authMiddleware, multerMiddleware, sendMessage);
router.get("/conversation", authMiddleware, getConversation);
router.get(
  "/conversation/:conversationId/messages",
  authMiddleware,
  getMessages
);
router.put("/messages/read", authMiddleware, markAsRead);
router.put("/messages/:messageId", authMiddleware, deleteMessage);

export default router;
