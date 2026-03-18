import express from "express";
import {
  createNomination,
  updateNomination,
  getMyNominations,
  getTopNominees,
} from "./nomination.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";

const router = express.Router();

// User
router.post("/", authMiddleware, createNomination);
router.put("/", authMiddleware, updateNomination);
router.get("/me", authMiddleware, getMyNominations);

// Admin
router.get(
  "/admin/top",
  authMiddleware,
  adminMiddleware,
  getTopNominees
);

export default router;