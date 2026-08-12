import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { getDriverFleetSummary, getDriverLeaderboard, getTopDrivers } from "../services/drivers.service";

export const getDrivers = asyncHandler(async (req: Request, res: Response) => {
  const sortBy = req.query.sortBy as "trips" | "rating" | "fare" | undefined;
  const sortDir = req.query.sortDir as "asc" | "desc" | undefined;
  const [leaderboard, summary] = await Promise.all([
    getDriverLeaderboard({ sortBy, sortDir }),
    getDriverFleetSummary(),
  ]);
  res.json({ summary, drivers: leaderboard });
});

export const getTopDriversHandler = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit ?? 5);
  res.json(await getTopDrivers(limit));
});
