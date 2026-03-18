import { Request, Response } from "express";
import { UserService } from "./user.service";

export const uploadUsers = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "CSV required" });
    }

    const result: any = await UserService.processCSV(file.path);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Error uploading users" });
  }
};

export const getAllUsers = async (_: Request, res: Response) => {
  const data = await UserService.getAllUsers();
  res.json(data);
};