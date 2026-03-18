import mongoose from "mongoose";

const titleVoteSchema = new mongoose.Schema(
  {
    titleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Title",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    voteType: {
      type: String,
      enum: ["upvote", "downvote"],
      required: true,
    },
  },
  { timestamps: true }
);

// prevent duplicate votes
titleVoteSchema.index({ titleId: 1, userId: 1 }, { unique: true });

export const TitleVote = mongoose.model("TitleVote", titleVoteSchema);