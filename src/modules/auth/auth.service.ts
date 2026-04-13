import { User } from "../user/user.model";
import { Otp } from "../../models/otp.model";
import { generateOTP } from "../../utils/otp";
import { sendMail } from "../../utils/mailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export class AuthService {
  static async sendOtp(usn: string) {
    const user = await User.findOne({ usn });

    if (!user) throw new Error("User not found");

    const otp = generateOTP();
    
    // Hash the OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.create({
      usn,
      email: user.email,
      otp: undefined, // Do not store plain OTP
      hashedOtp, // Store hashed OTP
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // Send the plain OTP to the user's email
    await sendMail(user.email, otp);

    return {
      message: "OTP sent",
      email: user.email.slice(0, 5) + "***",
    };
  }

  static async verifyOtp(usn: string, otp: string) {
    const record = await Otp.findOne({ usn });

    if (!record) throw new Error("Invalid OTP");

    // Check if OTP is expired
    if (!record.expiresAt || record.expiresAt < new Date()) {
      // Delete expired OTP record
      await Otp.deleteOne({ _id: record._id });
      throw new Error("OTP expired");
    }

    // Compare the provided OTP with the hashed OTP
    if (!record.hashedOtp) {
      throw new Error("OTP not found or invalid");
    }

    const isValidOtp = await bcrypt.compare(otp, record.hashedOtp);

    if (!isValidOtp) {
      throw new Error("Invalid OTP");
    }

    // Delete the OTP record after successful verification
    await Otp.deleteOne({ _id: record._id });

    const user = await User.findOne({ usn });

    const token = jwt.sign(
      { userId: user!._id, role: user!.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return { token };
  }
}