import mongoose from "mongoose";

const finalNomineeSchema = new mongoose.Schema({
  titleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Title",
    required: true,
  },
  nominees: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      count: Number,
    },
  ],
  generatedAt: Date,
});

export const FinalNominee = mongoose.model(
  "FinalNominee",
  finalNomineeSchema
);