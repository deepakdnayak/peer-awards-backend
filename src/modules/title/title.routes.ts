import express from "express";
import {
  createTitle,
  getTitles,
  voteTitle,
  approveTitle,
  updateTitle,
  deleteTitle,
  getAllTitles,
} from "./title.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";

const router = express.Router();

// Student
router.post("/", authMiddleware, createTitle);
router.get("/", getTitles);
router.post("/vote", authMiddleware, voteTitle);

// Admin
router.get("/admin/all", authMiddleware, adminMiddleware, getAllTitles);
router.put("/admin/:id", authMiddleware, adminMiddleware, updateTitle);
router.delete("/admin/:id", authMiddleware, adminMiddleware, deleteTitle);
router.patch("/admin/approve/:id", authMiddleware, adminMiddleware, approveTitle);

export default router;