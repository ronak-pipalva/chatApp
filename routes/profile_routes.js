import express from "express";
import {
  getProfile,
  updateProfile,
} from "../controllers/profile_controller.js";
import { sendError, sendSuccess } from "../utils/utility_functions.js";
import Authenticate from "../middlewares/auth.js";
import { uploadWithErrorHandling } from "../middlewares/file_upload.js";

const router = express.Router();

router.get("/get-profile", Authenticate, async (req, res, next) => {
  try {
    const result = await getProfile(req, next);
    return sendSuccess(res, result, next);
  } catch (error) {
    console.log("error", error);
    return sendError(error, next);
  }
});

router.put(
  "/update-profile",
  Authenticate,
  uploadWithErrorHandling,
  async (req, res, next) => {
    try {
      const result = await updateProfile(req, next);
      return sendSuccess(res, result, next);
    } catch (error) {
      console.log("error", error);
      return sendError(error, next);
    }
  }
);
export default router;
