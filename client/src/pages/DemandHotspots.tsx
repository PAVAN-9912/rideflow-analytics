import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { DataState } from "../components/DataState";
import { HotspotMap } from "../maps/HotspotMap";
import type { Hotspot } from "../types";

export function DemandHotspots() {
  const [minTrips, setMinTrips] = useState("1");
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("");
  const [passengerCount, setPassengerCount] = useState("");

  const params = {
    minTrips,
    from: date || undefined,
    to: date ? `${date}T23:59:59.999Z` : undefined,
    hour: hour || undefined,
    passengerCount: passengerCount || undefined,
  };

  const { data, loading, error, refetch } = useFetch<Hotspot[]>(
    () => api.getHotspots(params),
    [JSON.stringify(params)]
  );

  const total = (data ?? []).reduce((sum, h) => sum + h.tripCount, 0);

  const clearFilters = () => {
    setDate("");
    setHour("");
    setPassengerCount("");
    setMinTrips("1");
  };

  const hasFilters = Boolean(date || hour || passengerCount || minTrips !== "1");

  return (
    <div>
      <div className="rounded-xl p-4 bg-white border border-border mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="text-xs text-sub">
            Filter pickup clusters by date, hour of day, passengers, or minimum trips threshold.
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-accentsoft text-accent font-medium self-start sm:self-auto">
            Dataset Range: Dec 31, 2024 – Jan 2, 2025
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-sub mb-1">Date</label>
            <input
              type="date"
              min="2024-12-31"
              max="2025-01-02"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm bg-paper border border-border outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-sub mb-1">Hour (0-23)</label>
            <input
              type="number"
              placeholder="e.g. 14"
              min={0}
              max={23}
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm bg-paper border border-border outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-sub mb-1">Passengers</label>
            <input
              type="number"
              placeholder="e.g. 2"
              min={1}
              max={8}
              value={passengerCount}
              onChange={(e) => setPassengerCount(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm bg-paper border border-border outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-sub mb-1">Minimum trips</label>
            <input
              type="number"
              placeholder="Minimum trips"
              min={1}
              value={minTrips}
              onChange={(e) => setMinTrips(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm bg-paper border border-border outline-none focus:border-accent"
            />
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <button
              onClick={clearFilters}
              className="rounded-lg px-3 py-1.5 text-xs font-medium bg-paper border border-border text-sub hover:text-ink transition"
            >
              Reset Filters
            </button>
            <span className="text-xs text-sub">
              Showing {data?.length ?? 0} matching hotspot zones
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 rounded-xl p-5 bg-white border border-border">
          <h3 className="text-sm font-semibold mb-4">Pickup Density</h3>
          <div className="h-[420px]">
            <DataState
              data={data}
              loading={loading}
              error={error}
              onRetry={refetch}
              isEmpty={(d) => d.length === 0}
              emptyTitle="No hotspots found for this filter"
              emptyHint={
                date && (date < "2024-12-31" || date > "2025-01-02")
                  ? `Selected date (${date}) is outside dataset range. Please select Dec 31, 2024 – Jan 2, 2025.`
                  : "Try adjusting your filters or click 'Reset Filters' to view all hotspots."
              }
            >
              {(d) => <HotspotMap hotspots={d} />}
            </DataState>
          </div>
        </div>

        <div className="xl:col-span-2 rounded-xl p-5 bg-white border border-border">
          <h3 className="text-sm font-semibold mb-4">Top Pickup Zones</h3>
          <DataState
            data={data}
            loading={loading}
            error={error}
            onRetry={refetch}
            isEmpty={(d) => d.length === 0}
            emptyTitle="No zones found"
            emptyHint="Adjust filters to view top pickup zones."
          >
            {(d) => (
              <div className="flex flex-col gap-3">
                {d.slice(0, 10).map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="text-ink font-mono text-xs">
                        {h.latitude.toFixed(3)}, {h.longitude.toFixed(3)}
                      </div>
                      <div className="text-xs text-sub">{h.tripCount} trips · ${h.avgFare.toFixed(2)} avg fare</div>
                    </div>
                    <span className="font-mono text-sub text-xs">
                      {total ? Math.round((h.tripCount / total) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </DataState>
        </div>
      </div>
    </div>
  );
}
