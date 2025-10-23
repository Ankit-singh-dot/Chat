import mongoose from "mongoose";
const statusSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    contentType: {
      type: String,
      enum: ["image", "text", "video"],
      default: "text",
    },
    viewers: { type: mongoose.Schema.ObjectId, ref: "User" },
    expiredAt: { type: date, required: true },
  },
  { timestamps: true }
);
const Status = mongoose.model("Status", statusSchema);
export default Status;
