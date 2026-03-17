import express from "express";
import { sendOtp, verifyOtp } from "./auth.controller";
import { getMe } from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/me", authMiddleware, getMe);

export default router;