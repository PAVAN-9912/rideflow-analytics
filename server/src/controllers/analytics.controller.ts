import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { tripFiltersSchema } from "../utils/validation";
import {
  getDurationDistribution,
  getFareByHour,
  getFareDistribution,
  getPassengerDistribution,
  getPickupHotspots,
  getRatingDistribution,
  getTripsByHour,
} from "../services/analytics.service";

function extractFilters(req: Request) {
  const parsed = tripFiltersSchema.parse(req.query);
  return {
    from: parsed.from,
    to: parsed.to,
    minFare: parsed.minFare,
    maxFare: parsed.maxFare,
    minRating: parsed.minRating,
    passengerCount: parsed.passengerCount,
    driver_id: parsed.driver_id,
    hour: parsed.hour,
  };
}

export const fareByHour = asyncHandler(async (req: Request, res: Response) => {
  res.json(await getFareByHour(extractFilters(req)));
});

export const hotspots = asyncHandler(async (req: Request, res: Response) => {
  const minTrips = Number(req.query.minTrips ?? 1);
  res.json(await getPickupHotspots(extractFilters(req), minTrips));
});

export const fareDistribution = asyncHandler(async (req: Request, res: Response) => {
  res.json(await getFareDistribution(extractFilters(req)));
});

export const tripDuration = asyncHandler(async (req: Request, res: Response) => {
  res.json(await getDurationDistribution(extractFilters(req)));
});

export const passengers = asyncHandler(async (req: Request, res: Response) => {
  res.json(await getPassengerDistribution(extractFilters(req)));
});

export const ratingDistribution = asyncHandler(async (req: Request, res: Response) => {
  res.json(await getRatingDistribution(extractFilters(req)));
});

export const tripsByHour = asyncHandler(async (req: Request, res: Response) => {
  res.json(await getTripsByHour(extractFilters(req)));
});
