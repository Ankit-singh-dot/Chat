import express from "express";
import {
  checkAuthenticated,
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
router.get("/logout", logout);

// protected route
router.put("/update-profile", authMiddleware, multerMiddleware, updateProfile);
router.get("/check-auth", authMiddleware, multerMiddleware, checkAuthenticated);
export default router;
