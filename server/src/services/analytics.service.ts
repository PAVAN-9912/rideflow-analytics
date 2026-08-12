import { Trip } from "../models/Trip";
import { PipelineStage } from "mongoose";

export interface AnalyticsFilters {
  from?: Date;
  to?: Date;
  minFare?: number;
  maxFare?: number;
  minRating?: number;
  passengerCount?: number;
  driver_id?: string;
  hour?: number;
}

/** Shared $match stage builder so every analytics endpoint filters consistently. */
function buildMatchStage(f: AnalyticsFilters): Record<string, unknown> {
  const match: Record<string, unknown> = {};
  if (f.from || f.to) {
    match.timestamp = {
      ...(f.from ? { $gte: f.from } : {}),
      ...(f.to ? { $lte: f.to } : {}),
    };
  }
  if (f.minFare !== undefined || f.maxFare !== undefined) {
    match.fare = {
      ...(f.minFare !== undefined ? { $gte: f.minFare } : {}),
      ...(f.maxFare !== undefined ? { $lte: f.maxFare } : {}),
    };
  }
  if (f.minRating !== undefined) match.rating = { $gte: f.minRating };
  if (f.passengerCount !== undefined) match.passenger_count = f.passengerCount;
  if (f.driver_id) match.driver_id = f.driver_id;
  return match;
}

/** B. Average fare by hour-of-day, computed in the database via $group on $hour. */
export async function getFareByHour(filters: AnalyticsFilters) {
  const pipeline: PipelineStage[] = [
    { $match: buildMatchStage(filters) },
    {
      $group: {
        _id: { $hour: "$timestamp" },
        avgFare: { $avg: "$fare" },
        tripCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        hour: "$_id",
        avgFare: { $round: ["$avgFare", 2] },
        tripCount: 1,
      },
    },
  ];
  return Trip.aggregate(pipeline);
}

/**
 * A. Busiest pickup areas. Buckets pickup coordinates onto a coarse grid
 * (~0.01 deg cells, roughly city-block scale) so nearby pickups cluster
 * into zones without needing a separate zones/geofence collection.
 */
export async function getPickupHotspots(filters: AnalyticsFilters, minTrips = 1) {
  const pipeline: PipelineStage[] = [
    { $match: buildMatchStage(filters) },
    {
      $group: {
        _id: {
          lng: { $round: [{ $arrayElemAt: ["$pickup_location.coordinates", 0] }, 2] },
          lat: { $round: [{ $arrayElemAt: ["$pickup_location.coordinates", 1] }, 2] },
        },
        tripCount: { $sum: 1 },
        avgFare: { $avg: "$fare" },
      },
    },
    { $match: { tripCount: { $gte: minTrips } } },
    { $sort: { tripCount: -1 } },
    { $limit: 50 },
    {
      $project: {
        _id: 0,
        longitude: "$_id.lng",
        latitude: "$_id.lat",
        tripCount: 1,
        avgFare: { $round: ["$avgFare", 2] },
      },
    },
  ];
  return Trip.aggregate(pipeline);
}

/** D. Fare distribution as a fixed-width histogram, computed with $bucket. */
export async function getFareDistribution(filters: AnalyticsFilters) {
  const pipeline: PipelineStage[] = [
    { $match: buildMatchStage(filters) },
    {
      $bucket: {
        groupBy: "$fare",
        boundaries: [0, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100, Number.MAX_SAFE_INTEGER],
        default: "100+",
        output: { count: { $sum: 1 } },
      },
    },
  ];
  return Trip.aggregate(pipeline);
}

/** Trip duration distribution histogram. */
export async function getDurationDistribution(filters: AnalyticsFilters) {
  const pipeline: PipelineStage[] = [
    { $match: buildMatchStage(filters) },
    {
      $bucket: {
        groupBy: "$duration",
        boundaries: [0, 5, 10, 15, 20, 30, 45, 60, 90, Number.MAX_SAFE_INTEGER],
        default: "90+",
        output: { count: { $sum: 1 } },
      },
    },
  ];
  return Trip.aggregate(pipeline);
}

/** Passenger count distribution. */
export async function getPassengerDistribution(filters: AnalyticsFilters) {
  const pipeline: PipelineStage[] = [
    { $match: buildMatchStage(filters) },
    { $group: { _id: "$passenger_count", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, passengerCount: "$_id", count: 1 } },
  ];
  return Trip.aggregate(pipeline);
}

/** Rating distribution, rounded to the nearest 0.5 star bucket. */
export async function getRatingDistribution(filters: AnalyticsFilters) {
  const pipeline: PipelineStage[] = [
    { $match: buildMatchStage(filters) },
    {
      $group: {
        _id: { $divide: [{ $round: [{ $multiply: ["$rating", 2] }, 0] }, 2] },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, rating: "$_id", count: 1 } },
  ];
  return Trip.aggregate(pipeline);
}

/** Trip volume by hour-of-day (distinct from average-fare-by-hour). */
export async function getTripsByHour(filters: AnalyticsFilters) {
  const pipeline: PipelineStage[] = [
    { $match: buildMatchStage(filters) },
    { $group: { _id: { $hour: "$timestamp" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, hour: "$_id", count: 1 } },
  ];
  return Trip.aggregate(pipeline);
}

/** E/F. Headline trip statistics for the dashboard KPI row - a single aggregation, not four. */
export async function getTripStatistics(filters: AnalyticsFilters) {
  const pipeline: PipelineStage[] = [
    { $match: buildMatchStage(filters) },
    {
      $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        avgFare: { $avg: "$fare" },
        avgDuration: { $avg: "$duration" },
        avgRating: { $avg: "$rating" },
        totalRevenue: { $sum: "$fare" },
      },
    },
    {
      $project: {
        _id: 0,
        totalTrips: 1,
        avgFare: { $round: ["$avgFare", 2] },
        avgDuration: { $round: ["$avgDuration", 1] },
        avgRating: { $round: ["$avgRating", 2] },
        totalRevenue: { $round: ["$totalRevenue", 2] },
      },
    },
  ];
  const [result] = await Trip.aggregate(pipeline);
  return result ?? { totalTrips: 0, avgFare: 0, avgDuration: 0, avgRating: 0, totalRevenue: 0 };
}
