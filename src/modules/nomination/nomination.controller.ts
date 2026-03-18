import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { NominationService } from "./nomination.service";

// Create
export const createNomination = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { titleId, nomineeId } = req.body;

    const data = await NominationService.createNomination(
      req.user!.userId,
      titleId,
      nomineeId
    );

    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// Update
export const updateNomination = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { titleId, nomineeId } = req.body;

    const data = await NominationService.updateNomination(
      req.user!.userId,
      titleId,
      nomineeId
    );

    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// Get my nominations
export const getMyNominations = async (
  req: AuthRequest,
  res: Response
) => {
  const data = await NominationService.getMyNominations(
    req.user!.userId
  );
  res.json(data);
};

// Admin: top nominees
export const getTopNominees = async (_: any, res: Response) => {
  const data = await NominationService.getTopNominees();
  res.json(data);
};