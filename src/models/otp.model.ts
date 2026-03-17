import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  usn: String,
  email: String,
  otp: String,
  expiresAt: Date,
});

export const Otp = mongoose.model("Otp", otpSchema);