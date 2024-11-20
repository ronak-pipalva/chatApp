import express from "express";
import { sendError, sendSuccess } from "../utils/utility_functions.js";
import {
  login,
  register,
  resendOtp,
  verifyEmail,
} from "../controllers/auth_controller.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const result = await register(req, next);
    return sendSuccess(res, result, next);
  } catch (error) {
    return sendError(error, next);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const result = await login(req, next);
    return sendSuccess(res, result, next);
  } catch (error) {
    return sendError(error, next);
  }
});

router.post("/verify-email", async (req, res, next) => {
  try {
    const result = await verifyEmail(req, next);
    return sendSuccess(res, result, next);
  } catch (error) {
    return sendError(error, next);
  }
});

router.post("/resend-otp", async (req, res, next) => {
  try {
    const result = await resendOtp(req, next);
    return sendSuccess(res, result, next);
  } catch (error) {
    return sendError(error, next);
  }
});

export default router;
