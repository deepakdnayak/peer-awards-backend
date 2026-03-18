import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    titleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Title",
      required: true,
    },
    nomineeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// 🔒 one vote per user per title
voteSchema.index({ userId: 1, titleId: 1 }, { unique: true });

export const Vote = mongoose.model("Vote", voteSchema);