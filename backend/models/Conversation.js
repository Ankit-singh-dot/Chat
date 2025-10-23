import mongoose from "mongoose";
const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
//   participant are actully stored in array and refeing to user 
  lastMessage: { type: mongoose.Schema.ObjectId, ref: "Message" },
  unreadCount: { type: Number, default: 0 },
});
const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
