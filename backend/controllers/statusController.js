import { uploadFileToCloudinary } from "../config/cloudnaryConfig.js";
import Status from "../models/Status.js";
import response from "../utils/responseHandler.js";

export const createStatus = async (req, res) => {
  try {
    const { content, contentType } = req.body;
    const userId = req.user.userId;
    const file = req.file;
    let mediaUrl = null;
    let finalContentType = contentType || "text";
    if (file) {
      const uploadFile = await uploadFileToCloudinary(file);
      if (!uploadFile?.secure_url) {
        return response(res, 400, "failed to upload media");
      }
      mediaUrl = uploadFile?.secure_url;
      //   finalContentType = uploadFile?.secure_url;
      if (file.mimetype.startsWith("image")) {
        contentType = "image";
      } else if (file.mimetype.startsWith("video")) {
        contentType = "video";
      } else {
        return response(res, 400, "unsupported file type");
      }
      const expireAt = new Date();
      expireAt.setHours(expireAt.getHours() + 24);

      const status = new Status({
        user: userId,
        content: mediaUrl || content,
        contentType: finalContentType,
        expireAt,
      });
      await status.save();
      const populateStatus = await Status.findOne(status?._id)
        .populate("user", "userName profilePicture")
        .populate("viewers", "userName profilePicture");
      // emit socket event
      if (req.io && req.socketUserMap) {
        // broadcasting msg to other except the user which one is broadcasting the message
        for (const [connectingUserId, socketId] of req.socketUserMap) {
          if (connectingUserId !== userId) {
            req.io.to(socketId).emit("new_status", populateStatus);
          }
        }
      }
      return response(res, 201, "Status created successfully", populateStatus);
    }
  } catch (error) {
    console.error(error);
    return response(res, 500, "internal server error");
  }
};
export const getStatuses = async (req, res) => {
  try {
    const statuses = await Status.find({
      expiredAt: { $gt: new Date() },
    })
      .populate("user", "userName profilePicture")
      .populate("viewers", "userName profilePicture")
      .sort({ createdAt: -1 });
    // createdAt: -1 means latest first
    // createdAt: 1 means ascending order (oldest first).
    return response(res, 201, "Status fetched successfully", statuses);
  } catch (error) {
    console.error(error);
    return response(res, 500, "internal server error");
  }
};
export const viewStatus = async (req, res) => {
  const { statusId } = req.params;
  const userId = req.user.userId;
  try {
    const status = await Status.findById(statusId);
    if (!status) {
      return response(res, 404, "status not found");
    }
    const updatedStatus = await Status.findByIdAndUpdate(
      statusId,
      {
        $addToSet: { viewers: userId },
      },
      { new: true }
    )
      .populate("user", "userName profilePicture")
      .populate("viewers", "userName profilePicture");

    if (req.io && req.socketUserMap) {
      const statusOwnerSocketId = req.socketUserMap.get(status.user.toString());
      if (statusOwnerSocketId) {
        const viewData = {
          statusId,
          viewerId: userId,
          totalViewers: updatedStatus.viewers.length,
          viewers: updatedStatus.viewers,
        };
        req.io.to(statusOwnerSocketId).emit("status_viewed", viewData);
      }
    }
    return response(res, 200, "Status fetched successfully", updatedStatus);
  } catch (error) {
    console.error(error);
    return response(res, 500, "internal server error");
  }
};

export const deleteStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { statusId } = req.params;
    const status = await Status.findById(statusId);
    if (!status) {
      return response(res, 404, "Status not found");
    }
    if (status.user.toString() !== userId) {
      return response(res, 403, "You can only delete your own status");
    }
    await Status.findByIdAndDelete(statusId);
    if (req.io && req.socketUserMap) {
      for (const [connectingUserId, socketId] of req.socketUserMap) {
        if (connectingUserId !== userId) {
          req.io.to(socketId).emit("status_deleted", statusId);
        }
      }
    }
    return response(res, 200, "Status deleted successfully");
  } catch (error) {
    console.error(error);
    return response(res, 500, "internal server error");
  }
};

// 3:52
