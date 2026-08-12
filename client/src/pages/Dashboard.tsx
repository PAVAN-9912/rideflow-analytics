import { ChevronRight, Clock, Gauge, CircleDollarSign, Route } from "lucide-react";
import { Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { KpiCard } from "../components/KpiCard";
import { DataState } from "../components/DataState";
import { FareByHourChart } from "../charts/FareByHourChart";
import { HotspotMap } from "../maps/HotspotMap";
import { DriversTable } from "../tables/DriversTable";
import { TripsTable } from "../tables/TripsTable";
import type { DashboardSummary } from "../types";

export function Dashboard() {
  const { data, loading, error, refetch } = useFetch<DashboardSummary>(() => api.getDashboard());

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-[26px] font-semibold text-ink">Good morning, Admin</h1>
        <p className="text-sm mt-1 text-sub">Here's your ride-sharing analytics overview.</p>
      </div>

      <DataState data={data} loading={loading} error={error} onRetry={refetch}>
        {(d) => (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <KpiCard label="Total Trips" value={d.stats.totalTrips.toLocaleString()} icon={Route} />
              <KpiCard label="Average Fare" value={`$${d.stats.avgFare.toFixed(2)}`} icon={CircleDollarSign} />
              <KpiCard label="Avg Trip Duration" value={`${d.stats.avgDuration.toFixed(1)} min`} icon={Clock} />
              <KpiCard label="Average Rating" value={d.stats.avgRating.toFixed(2)} icon={Gauge} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-6">
              <div className="xl:col-span-3 rounded-xl p-5 bg-white border border-border">
                <h3 className="text-sm font-semibold mb-4">Pickup Demand Hotspots</h3>
                <div className="h-[280px]">
                  {d.hotspots.length > 0 ? (
                    <HotspotMap hotspots={d.hotspots} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-sub">No pickup data yet</div>
                  )}
                </div>
              </div>

              <div className="xl:col-span-2 rounded-xl p-5 bg-white border border-border">
                <h3 className="text-sm font-semibold mb-4">Average Fare by Hour</h3>
                <div style={{ height: 240 }}>
                  <FareByHourChartLoader />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
              <div className="xl:col-span-2 rounded-xl p-5 bg-white border border-border">
                <h3 className="text-sm font-semibold mb-4">Top Drivers</h3>
                <DriversTable drivers={d.topDrivers} />
              </div>

              <div className="xl:col-span-3 rounded-xl p-5 bg-white border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">Recent Trips</h3>
                  <Link
                    to="/trips"
                    className="text-xs font-medium flex items-center gap-1 rounded-lg px-3 py-1.5 bg-accentsoft text-accent"
                  >
                    View All Trips <ChevronRight size={12} />
                  </Link>
                </div>
                <TripsTable trips={d.recentTrips} />
              </div>
            </div>
          </>
        )}
      </DataState>
    </div>
  );
}

/** Dashboard's own fare-by-hour data pull, kept separate from the summary payload for independent retry. */
function FareByHourChartLoader() {
  const { data, loading, error, refetch } = useFetch(() => api.getFareByHour());
  return (
    <DataState data={data} loading={loading} error={error} onRetry={refetch} isEmpty={(d) => d.length === 0}>
      {(d) => <FareByHourChart data={d} />}
    </DataState>
  );
}
