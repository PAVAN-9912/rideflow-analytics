import { Trip } from "../models/Trip";
import { PipelineStage } from "mongoose";

export interface DriverSort {
  sortBy?: "trips" | "rating" | "fare";
  sortDir?: "asc" | "desc";
}

/** C. Driver leaderboard - trips, average rating, average fare, average duration per driver. */
export async function getDriverLeaderboard(opts: DriverSort = {}) {
  const sortField =
    opts.sortBy === "rating" ? "avgRating" : opts.sortBy === "fare" ? "avgFare" : "totalTrips";
  const sortDir = opts.sortDir === "asc" ? 1 : -1;

  const pipeline: PipelineStage[] = [
    {
      $group: {
        _id: "$driver_id",
        totalTrips: { $sum: 1 },
        avgRating: { $avg: "$rating" },
        avgFare: { $avg: "$fare" },
        avgDuration: { $avg: "$duration" },
      },
    },
    { $sort: { [sortField]: sortDir } },
    {
      $project: {
        _id: 0,
        driver_id: "$_id",
        totalTrips: 1,
        avgRating: { $round: ["$avgRating", 2] },
        avgFare: { $round: ["$avgFare", 2] },
        avgDuration: { $round: ["$avgDuration", 1] },
      },
    },
  ];
  return Trip.aggregate(pipeline);
}

export async function getTopDrivers(limit = 5) {
  const rows = await getDriverLeaderboard({ sortBy: "rating", sortDir: "desc" });
  return rows.slice(0, limit);
}

export async function getDriverFleetSummary() {
  const pipeline: PipelineStage[] = [
    {
      $group: {
        _id: "$driver_id",
        trips: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
    {
      $group: {
        _id: null,
        totalDrivers: { $sum: 1 },
        avgRating: { $avg: "$avgRating" },
        avgTripsPerDriver: { $avg: "$trips" },
        topDriverRating: { $max: "$avgRating" },
      },
    },
  ];
  const [result] = await Trip.aggregate(pipeline);
  return (
    result ?? { totalDrivers: 0, avgRating: 0, avgTripsPerDriver: 0, topDriverRating: 0 }
  );
}
