import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  usn: String,
  email: String,
  otp: String, // Deprecated: kept for backward compatibility, plain OTP (should not store plain OTP)
  hashedOtp: String, // New: Hashed OTP for security
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
});

// Add index to automatically delete expired OTP records
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model("Otp", otpSchema);