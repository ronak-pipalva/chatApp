import { v2 as cloudinary } from "cloudinary";
import ApiError from "../utils/api_error.js";

// Configuration
cloudinary.config({
  cloud_name: "dylte0sf1",
  api_key: "177685847586997",
  api_secret: "Ggw3qaG3tmAvw-BjewtH26oEtYE", // Click 'View Credentials' below to copy your API secret
});

const uploadToCloudinary = async (files, folder) => {
  try {
    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const uploadOptions = {
          folder,
          resource_type: file.mimetype.includes("video") ? "video" : "image",
        };
        cloudinary.uploader
          .upload_stream(uploadOptions, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new ApiError(500, "Error uploading to Cloudinary");
  }
};

export { uploadToCloudinary };
