import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, unique: true, sparse: true },
    phoneSuffix: { type: String, unique: false },
    userName: { type: String },
    email: {
      type: String,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    emailOtp: { type: String },
    emailOtpExpiry: { type: Date },
    profilePicture: { type: String },
    about: { type: String },
    lastSeen: { type: Date },
    isOnline: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    agreed: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const user = mongoose.model("User", userSchema);
export default user;
