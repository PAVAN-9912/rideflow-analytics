import { useState } from "react";
import { Gauge, Star, Trophy, Users } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { DataState } from "../components/DataState";
import { KpiCard } from "../components/KpiCard";
import { DriversTable } from "../tables/DriversTable";

export function Drivers() {
  const [sortBy, setSortBy] = useState<"trips" | "rating" | "fare">("trips");
  const { data, loading, error, refetch } = useFetch(() => api.getDrivers({ sortBy, sortDir: "desc" }), [sortBy]);

  return (
    <div>
      <DataState data={data} loading={loading} error={error} onRetry={refetch}>
        {(d: any) => (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <KpiCard label="Total Drivers" value={String(d.summary.totalDrivers)} icon={Users} />
              <KpiCard label="Average Rating" value={d.summary.avgRating.toFixed(2)} icon={Star} />
              <KpiCard label="Top Driver Rating" value={d.summary.topDriverRating.toFixed(2)} icon={Trophy} />
              <KpiCard label="Avg Trips / Driver" value={d.summary.avgTripsPerDriver.toFixed(1)} icon={Gauge} />
            </div>

            <div className="rounded-xl p-5 bg-white border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Driver Leaderboard</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-lg px-3 py-1.5 text-xs bg-paper border border-border"
                >
                  <option value="trips">Sort by trips</option>
                  <option value="rating">Sort by rating</option>
                  <option value="fare">Sort by fare</option>
                </select>
              </div>
              <DriversTable drivers={d.drivers} />
            </div>
          </>
        )}
      </DataState>
    </div>
  );
}
