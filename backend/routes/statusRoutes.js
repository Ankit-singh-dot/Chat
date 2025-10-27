import express from "express";
const router = express.Router();
import { authMiddleware } from "../middleware/authMiddleware.js";
import { multerMiddleware } from "../config/cloudnaryConfig.js";
import {
  createStatus,
  deleteStatus,
  getStatuses,
  viewStatus,
} from "../controllers/statusController.js";
router.post("/", authMiddleware, multerMiddleware, createStatus);
router.get("/", authMiddleware, multerMiddleware, getStatuses);
router.put("/:statusId/view", authMiddleware, multerMiddleware, viewStatus);
router.delete(
  "/:statusId/delete",
  authMiddleware,
  multerMiddleware,
  deleteStatus
);
export default router;
