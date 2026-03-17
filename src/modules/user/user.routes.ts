import express from "express";
import multer from "multer";
import { uploadUsers } from "./user.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

// 🔐 Protected Admin Route
router.post(
  "/upload-users",
  authMiddleware,
  adminMiddleware,
  upload.single("file"),
  uploadUsers
);

export default router;