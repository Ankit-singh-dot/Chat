import mongoose from "mongoose";
const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  lastMessage: { type: mongoose.Schema.ObjectId, ref: "Messages" },
  unreadCount: { type: Number, default: 0 },
});
const Conversation = mongoose.model("Conversation", conversationSchema);
export default conversationSchema;
