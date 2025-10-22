import { uploadFileToCloudinary } from "../config/cloudnaryConfig";
import Conversation from "../models/Conversation";
import response from "../utils/responseHandler";
import Message from "../models/Messages";

export const sendMessage = async () => {
  try {
    const { senderId, receiverId, content, messageStatus } = req.body;
    const file = req.file;
    const participants = [senderId, receiverId].sort();
    let conversation = Conversation.findOne({
      participants: participants,
    });
    if (!conversation) {
      conversation = new Conversation({
        participants,
      });
      await conversation.save();
    }
    let imageORVideoUrl = null;
    let contentType = null;
    if (file) {
      const uploadFile = await uploadFileToCloudinary(file);
      if (!uploadFile.secure_url) {
        return response(res, 400, "failed to upload media");
      }
      imageORVideoUrl = uploadFile?.secure_url;
      if (file.mimetype.startWith("image")) {
        contentType = "image";
      } else if (file.mimetype.startWith("video")) {
        contentType = "video";
      } else {
        return response(res, 400, "unsupported file type");
      }
    } else if (content?.trim()) {
      contentType = "text";
    } else {
      return response(res, 400, "Message content is required");
    }
    const message = new Message({
      conversation: conversation?._id,
      sender: senderId,
      receiverId: receiverId,
      content,
      imageORVideoUrl,
      messageStatus,
    });
    await message.save();
    if (message?.contentType) {
      conversation.lastMessage = message?._id;
    }
    conversation.unreadCount += 1;
    await conversation.save();
    const populateMessage = await Message.findOne(message?._id)
      .populate("sender", "userName profilePicture")
      .populate("receiver", "userName profilePicture");
    return response(res, 201, "Message send successfully", populateMessage);
  } catch (error) {
    console.error(error);
    return response(res, 500, "internal server error");
  }
};

export const getConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    const userId = [senderId, receiverId].sort();
    let conversation = Conversation.find({
      participants: userId,
    })
      .populate("participant", "userName profilePicture lastSeen, isOnline")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender receiver",
          select: "userName , profilePicture",
        },
      })
      .sort({ updatedAt: -1 });
    return response(res, 201, "Conversation get successfully", conversation);
  } catch (error) {
    console.error(error);
    return response(res, 500, "internal server error");
  }
};

export const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return response(res, 201, "Conversation not found ");
    }
    if (!conversation.participants.includes(userId)) {
      return response(req, 403, "not authorized to view this convo ");
    }
    const message = await Message.find({ conversation: conversationId })
      .populate("sender", "userName profilePicture")
      .populate("receiver", "userName profilePicture")
      .sort("createdAt");
    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: userId,
        messageStatus: { $in: ["send", "delivered"] },
      },
      { $set: { messageStatus: "read" } }
    );
    conversation.unreadCount = 0;
    await conversation.save();
    return response(res, 201, "Message fetched", message);
  } catch (error) {
    console.error(error);
    return response(res, 500, "internal server error");
  }
};
export const markAsRead = async (req, res) => {
  const { messageIds } = req.body;
  const userId = req.user.userId;
  try {
    let message = await Message.find({
      _id: { $in: messageIds },
      receiver: userId,
    });
    await Message.updateMany(
      {
        _id: { $in: messageIds },
        receive: userId,
      },
      { $set: { messageStatus: "read" } }
    );
    return response(res, 200, "Messages marked as read", message);
  } catch (error) {
    console.error(error);
    return response(res, 500, "internal server error");
  }
};
export const deleteMessage = async (req, res) => {
  const { messageId } = req.body;
  const userId = req.user.userId;
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return response(res, 404, "messages not found");
    }
    if (message.sender.toString() == !userId) {
      return response(res, 403, "Not authorized to delete this message");
    }
    await message.deleteOne();
    return response(res, 201, "Message deleted successfully");
  } catch (error) {
    console.error(error);
    return response(res, 500, "internal server error");
  }
};
// 3:24