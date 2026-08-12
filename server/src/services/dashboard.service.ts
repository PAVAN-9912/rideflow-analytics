import { getTripStatistics } from "./analytics.service";
import { getRecentTrips } from "./trips.service";
import { getTopDrivers } from "./drivers.service";
import { getPickupHotspots } from "./analytics.service";

/** Aggregates everything the dashboard needs into one payload, each piece backed by its own pipeline. */
export async function getDashboardSummary() {
  const [stats, recentTrips, topDrivers, hotspots] = await Promise.all([
    getTripStatistics({}),
    getRecentTrips(5),
    getTopDrivers(5),
    getPickupHotspots({}, 3),
  ]);

  return { stats, recentTrips, topDrivers, hotspots: hotspots.slice(0, 12) };
}
