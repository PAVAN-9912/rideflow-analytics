import { Trip } from "../models/Trip";
import { PaginationParams } from "../utils/pagination";

export interface TripFilters {
  driver_id?: string;
  minFare?: number;
  maxFare?: number;
  minRating?: number;
  passengerCount?: number;
  from?: Date;
  to?: Date;
  hour?: number;
}

function buildFilterQuery(f: TripFilters) {
  const query: Record<string, unknown> = {};
  if (f.driver_id) query.driver_id = f.driver_id;
  if (f.minFare !== undefined || f.maxFare !== undefined) {
    query.fare = {
      ...(f.minFare !== undefined ? { $gte: f.minFare } : {}),
      ...(f.maxFare !== undefined ? { $lte: f.maxFare } : {}),
    };
  }
  if (f.minRating !== undefined) query.rating = { $gte: f.minRating };
  if (f.passengerCount !== undefined) query.passenger_count = f.passengerCount;
  if (f.from || f.to) {
    query.timestamp = {
      ...(f.from ? { $gte: f.from } : {}),
      ...(f.to ? { $lte: f.to } : {}),
    };
  }
  if (f.hour !== undefined) {
    // hour-of-day filter needs an aggregation $expr since it's not a stored field
    query.$expr = { $eq: [{ $hour: "$timestamp" }, f.hour] };
  }
  return query;
}

export async function listTrips(
  filters: TripFilters,
  pagination: PaginationParams,
  sort: { sortBy?: string; sortDir?: string } = {}
) {
  const query = buildFilterQuery(filters);
  const sortField = sort.sortBy ?? "timestamp";
  const sortDir = sort.sortDir === "asc" ? 1 : -1;

  const [items, total] = await Promise.all([
    Trip.find(query)
      .sort({ [sortField]: sortDir })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    Trip.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}

export async function getTripById(tripId: number) {
  return Trip.findOne({ trip_id: tripId }).lean();
}

export async function getRecentTrips(limit = 5) {
  return Trip.find().sort({ timestamp: -1 }).limit(limit).lean();
}

/**
 * Geospatial nearby-trip search. Executes a real MongoDB $geoNear against the
 * 2dsphere index on pickup_location - distances are computed by MongoDB, not
 * recalculated on the frontend.
 */
export async function findNearbyTrips(lat: number, lng: number, radiusMeters: number, limit = 50) {
  return Trip.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [lng, lat] }, // GeoJSON order: [lng, lat]
        distanceField: "distanceMeters",
        maxDistance: radiusMeters,
        spherical: true,
        query: {},
      },
    },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        trip_id: 1,
        driver_id: 1,
        fare: 1,
        duration: 1,
        rating: 1,
        pickup_location: 1,
        dropoff_location: 1,
        timestamp: 1,
        distanceMeters: { $round: ["$distanceMeters", 0] },
      },
    },
  ]);
}
