import { multerMiddleware } from "../config/cloudnaryConfig";
import {
  getConversation,
  getMessages,
  markAsRead,
  sendMessage,
} from "../controllers/chatController";
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
const router = express.Router();
router.post("/sendMessages", authMiddleware, multerMiddleware, sendMessage);
router.get("/conversation", authMiddleware, getConversation);
router.get(
  "/conversation/:conversationId/messages",
  authMiddleware,
  getMessages
);
router.put("/messages/read", authMiddleware, markAsRead);
router.put("/messages/:messageId", authMiddleware, markAsRead);

export default router;
