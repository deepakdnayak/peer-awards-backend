import { Request, Response } from "express";
import { TitleService } from "./title.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

// Student: create
export const createTitle = async (req: AuthRequest, res: Response) => {
  try {
    const data = await TitleService.createTitle(
      req.user!.userId,
      req.body
    );
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// Public: get approved
export const getTitles = async (_: Request, res: Response) => {
  const data = await TitleService.getApprovedTitles();
  res.json(data);
};

// Vote
export const voteTitle = async (req: AuthRequest, res: Response) => {
  try {
    const { titleId, voteType } = req.body;

    const data = await TitleService.voteTitle(
      req.user!.userId,
      titleId,
      voteType
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error voting" });
  }
};

// ADMIN APIs

export const approveTitle = async (req: AuthRequest, res: Response) => {
  const data = await TitleService.approveTitle(
    req.user!.userId,
    req.params.id as string
  );
  res.json(data);
};

export const updateTitle = async (req: Request, res: Response) => {
  try {
    const data = await TitleService.updateTitle(
      req.params.id as string,
      req.body
    );
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteTitle = async (req: Request, res: Response) => {
  const data = await TitleService.deleteTitle(req.params.id as string);
  res.json(data);
};

export const getAllTitles = async (_: Request, res: Response) => {
  const data = await TitleService.getAllTitles();
  res.json(data);
};