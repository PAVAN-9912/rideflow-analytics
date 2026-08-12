import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { parsePagination } from "../utils/pagination";
import { nearbyQuerySchema, tripFiltersSchema } from "../utils/validation";
import { findNearbyTrips, getTripById, listTrips } from "../services/trips.service";

export const getTrips = asyncHandler(async (req: Request, res: Response) => {
  const parsed = tripFiltersSchema.parse(req.query);
  const pagination = parsePagination(req.query);
  const result = await listTrips(
    {
      driver_id: parsed.driver_id,
      minFare: parsed.minFare,
      maxFare: parsed.maxFare,
      minRating: parsed.minRating,
      passengerCount: parsed.passengerCount,
      from: parsed.from,
      to: parsed.to,
      hour: parsed.hour,
    },
    pagination,
    { sortBy: parsed.sortBy, sortDir: parsed.sortDir }
  );
  res.json(result);
});

export const getTripDetail = asyncHandler(async (req: Request, res: Response) => {
  const tripId = Number(req.params.id);
  const trip = await getTripById(tripId);
  if (!trip) {
    return res.status(404).json({ error: `Trip ${tripId} not found` });
  }
  res.json(trip);
});

/** GET /api/trips/nearby - real MongoDB $geoNear against the 2dsphere index. */
export const getNearbyTrips = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng, radius } = nearbyQuerySchema.parse(req.query);
  const trips = await findNearbyTrips(lat, lng, radius);
  res.json({ origin: { lat, lng }, radiusMeters: radius, count: trips.length, trips });
});
