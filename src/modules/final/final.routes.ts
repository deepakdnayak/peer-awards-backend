import express from "express";
import {
  finalizeNominees,
  submitVotes,
  getStats,
  getResults,
  getFinalNominees,
  freezeVoting,
} from "./final.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";

const router = express.Router();

// Admin
router.post(
  "/admin/finalize",
  authMiddleware,
  adminMiddleware,
  finalizeNominees
);

router.get(
  "/admin/stats",
  authMiddleware,
  adminMiddleware,
  getStats
);

// User
router.post("/vote", authMiddleware, submitVotes);

// Results (can be public or admin)
router.get("/results", getResults);

// User voting screen
router.get("/nominees", getFinalNominees);

router.post(
  "/admin/freeze-voting",
  authMiddleware,
  adminMiddleware,
  freezeVoting
);

export default router;