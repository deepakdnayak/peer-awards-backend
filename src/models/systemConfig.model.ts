import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema({
  currentPhase: {
    type: String,
    enum: ["title_creation", "nomination", "final_voting", "results"],
    default: "title_creation",
  },
  isVotingOpen: {
    type: Boolean,
    default: true,
  },
});

export const SystemConfig = mongoose.model(
  "SystemConfig",
  systemConfigSchema
);