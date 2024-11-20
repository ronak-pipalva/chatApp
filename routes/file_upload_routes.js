import express from "express";
import { uploadFile } from "../controllers/file_upload_controller.js";
import { sendError, sendSuccess } from "../utils/utility_functions.js";
import { uploadWithErrorHandling } from "../middlewares/file_upload.js";
import Authenticate from "../middlewares/auth.js";

const router = express.Router();

router.post(
  "/upload-file",
  Authenticate,
  uploadWithErrorHandling,
  async (req, res, next) => {
    try {
      const result = await uploadFile(req, next);
      return sendSuccess(res, result, next);
    } catch (error) {
      return sendError(error, next);
    }
  }
);

export default router;
