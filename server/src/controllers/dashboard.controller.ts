import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { getDashboardSummary } from "../services/dashboard.service";

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const summary = await getDashboardSummary();
  res.json(summary);
});
