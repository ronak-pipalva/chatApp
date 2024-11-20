import express from "express";
import authRoute from "./auth_routes.js";
import profileRoute from "./profile_routes.js";
import uploadFile from "./file_upload_routes.js";
const router = express.Router();

router.use(authRoute);
router.use(profileRoute);
router.use(profileRoute);
router.use(uploadFile);

export default router;
