import { User } from "../user/user.model";
import { Otp } from "../../models/otp.model";
import { generateOTP } from "../../utils/otp";
import { sendMail } from "../../utils/mailer";
import jwt from "jsonwebtoken";

export class AuthService {
  static async sendOtp(usn: string) {
    const user = await User.findOne({ usn });

    if (!user) throw new Error("User not found");

    const otp = generateOTP();

    await Otp.create({
      usn,
      email: user.email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendMail(user.email, `Your OTP is ${otp}`);

    return {
      message: "OTP sent",
      email: user.email.slice(0, 5) + "***",
    };
  }

  static async verifyOtp(usn: string, otp: string) {
    const record = await Otp.findOne({ usn, otp });

    if (!record) throw new Error("Invalid OTP");

    if (!record.expiresAt || record.expiresAt < new Date()) {
      throw new Error("Expired OTP");
    }

    if (record.expiresAt < new Date()) {
      throw new Error("Expired OTP");
    }

    const user = await User.findOne({ usn });

    const token = jwt.sign(
      { userId: user!._id, role: user!.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return { token };
  }
}