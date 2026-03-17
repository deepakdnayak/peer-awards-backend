import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { User } from "../user/user.model";

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { usn } = req.body;
    const data = await AuthService.sendOtp(usn);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { usn, otp } = req.body;
    const data = await AuthService.verifyOtp(usn, otp);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select("-__v");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
};