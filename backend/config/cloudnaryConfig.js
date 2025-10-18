import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

import dotenv from "dotenv";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secrets: process.env.CLOUDINARY_API_SECRETS,
});
export const uploadFileToCloudinary = (file) => {
  const options = {
    resources_type: file.mimetype.startWith("video") ? "video" : "image",
  };
  return new Promise((resolve, reject) => {
    const uploader = file.mimetype.startWith("video")
      ? cloudinary.uploader.upload_large
      : cloudinary.uploader.upload;
    uploader(file.path, options, (error, result) => {
      fs.unlink(file.path, () => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
    });
  });
};
export const multerMiddleware = multer({ dest: "uploads" }).single("media");
