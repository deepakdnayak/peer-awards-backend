import mongoose from "mongoose";

const nominationSchema = new mongoose.Schema(
  {
    titleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Title",
      required: true,
    },
    nominatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

// 🔒 Unique constraint (1 per user per title)
nominationSchema.index(
  { titleId: 1, nominatedBy: 1 },
  { unique: true }
);

export const Nomination = mongoose.model(
  "Nomination",
  nominationSchema
);