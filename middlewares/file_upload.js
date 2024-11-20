import multer from "multer";
import ApiError from "../utils/api_error.js";
import { response_objects } from "../utils/response/response_message.js";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const allowedVideoMimeTypes = [
  "video/mp4",
  "video/avi",
  "video/mov",
  "video/wmv",
];
const storage = multer.memoryStorage();
const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 3000 * 1024 * 1024, // 3 MB for images
    fields: 1000,
  },

  fileFilter: (req, file, cb) => {
    if (file.fieldname === "profile_image" || file.fieldname === "image") {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new ApiError(400, `"${file.fieldname}" must be a valid image file`));
      }
    } else if (file.fieldname === "video") {
      if (allowedVideoMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new ApiError(400, `"${file.fieldname}" must be a valid video file`));
      }
    } else {
      cb(null, true);
    }
  },
}).fields([
  { name: "image", maxCount: 100 }, // for multiple images
  { name: "profile_image", maxCount: 1 }, // for single profile image
  { name: "video", maxCount: 1 }, // for single video file
]);

const uploadWithErrorHandling = (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      if (err.field) {
        return next(new ApiError(400, `\"${err.field}\" is not allowed`));
      } else if (err instanceof multer.MulterError) {
        return next(new ApiError(400, err.message)); // Handle multer-specific errors
      } else if (err instanceof ApiError) {
        return next(err);
      }
      return next(new ApiError(500, response_objects[0].message));
    }

    return next(); // Proceed if no errors
  });
};

export { uploadWithErrorHandling };
