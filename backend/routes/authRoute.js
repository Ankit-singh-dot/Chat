import express from "express";
import {
  logout,
  sendOtp,
  updateProfile,
  verifyOtp,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { multerMiddleware } from "../config/cloudnaryConfig.js";
const router = express.Router();
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.put("/update-profile", authMiddleware, multerMiddleware, updateProfile);
router.get("logout", logout);
export default router;
