import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  titleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Title",
    required: true,
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  voteCount: Number,
  createdAt: Date,
});

export const Result = mongoose.model("Result", resultSchema);