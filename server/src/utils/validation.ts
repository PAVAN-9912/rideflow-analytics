import { z } from "zod";

/** Shared coordinate validation - GeoJSON order is [longitude, latitude]. */
export const coordinateSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(50).max(50000).default(1000), // meters
});

export const tripFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  driver_id: z.string().optional(),
  minFare: z.coerce.number().min(0).optional(),
  maxFare: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  passengerCount: z.coerce.number().int().min(1).max(8).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  hour: z.coerce.number().int().min(0).max(23).optional(),
  sortBy: z.enum(["timestamp", "fare", "duration", "rating"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});

export const tripDataSchema = z.object({
  trip_id: z.number(),
  driver_id: z.string(),
  passenger_count: z.number().min(1).max(8),
  pickup_location: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
  }),
  dropoff_location: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
  }),
  fare: z.number().min(0),
  duration: z.number().min(0),
  rating: z.number().min(1).max(5),
  timestamp: z.coerce.date(),
});

export class ValidationError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
