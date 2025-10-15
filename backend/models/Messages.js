import mongoose from "mongoose";
const MessageSchema = mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
    },
    imageORVideoUrl: {
      type: String,
    },
    contentType: {
      type: String,
      enum: ["image", "video", "text"],
    },
    reactions: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        emoji: String,
      },
    ],
    messageStatus: {
      type: String,
      default: send,
    },
  },
  { timestamp: true }
);
const Message = mongoose.model("Message", MessageSchema);
export default Message;
