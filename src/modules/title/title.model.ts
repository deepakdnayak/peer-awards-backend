import mongoose from "mongoose";

const titleSchema = new mongoose.Schema(
  {
    titleName: { type: String, required: true },

    // 🔥 NEW FIELD (for uniqueness)
    normalizedTitle: {
      type: String,
      required: true,
      unique: true,
    },

    description: { type: String },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    upvotesCount: { type: Number, default: 0 },
    downvotesCount: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: Date,
  },
  { timestamps: true }
);

export const Title = mongoose.model("Title", titleSchema);