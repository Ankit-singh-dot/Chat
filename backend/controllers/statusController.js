import { uploadFileToCloudinary } from "../config/cloudnaryConfig";
import Status from "../models/Status";
import response from "../utils/responseHandler";

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
      });
      await status.save();
      const populateStatus = await Status.findOne(status?._id)
        .populate("user", "userName profilePicture")
        .populate("viewer", "userName profilePicture");
      return response(res, 201, "Status created successfully", populateStatus);
    }
  } catch (error) {
    console.error(error);
    return response(res, 500, "internal server error");
  }
};
