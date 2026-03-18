import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { FinalService } from "./final.service";

// Admin
export const finalizeNominees = async (_: any, res: Response) => {
  const data = await FinalService.finalizeNominees();
  res.json(data);
};

// User
export const submitVotes = async (req: AuthRequest, res: Response) => {
  try {
    const data = await FinalService.submitVotes(
      req.user!.userId,
      req.body.votes
    );
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// Admin stats
export const getStats = async (_: any, res: Response) => {
  const data = await FinalService.getStats();
  res.json(data);
};

// Results
export const getResults = async (_: any, res: Response) => {
  try {
    const data = await FinalService.getResults();
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getFinalNominees = async (_: any, res: Response) => {
  try {
    const data = await FinalService.getFinalNominees();
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const freezeVoting = async (req: AuthRequest, res: Response) => {
  try {
    const data = await FinalService.freezeVotingAndGenerateResults(
      req.user!.userId
    );
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};