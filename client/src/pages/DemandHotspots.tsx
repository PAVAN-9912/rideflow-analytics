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
    to: date || undefined,
    hour: hour || undefined,
    passengerCount: passengerCount || undefined,
  };

  const { data, loading, error, refetch } = useFetch<Hotspot[]>(
    () => api.getHotspots(params),
    [JSON.stringify(params)]
  );

  const total = (data ?? []).reduce((sum, h) => sum + h.tripCount, 0);

  return (
    <div>
      <div className="rounded-xl p-4 bg-white border border-border mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg px-3 py-2 text-sm bg-paper border border-border" />
          <input type="number" placeholder="Hour (0-23)" value={hour} onChange={(e) => setHour(e.target.value)} className="rounded-lg px-3 py-2 text-sm bg-paper border border-border" />
          <input type="number" placeholder="Passengers" value={passengerCount} onChange={(e) => setPassengerCount(e.target.value)} className="rounded-lg px-3 py-2 text-sm bg-paper border border-border" />
          <input type="number" placeholder="Minimum trips" value={minTrips} onChange={(e) => setMinTrips(e.target.value)} className="rounded-lg px-3 py-2 text-sm bg-paper border border-border" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 rounded-xl p-5 bg-white border border-border">
          <h3 className="text-sm font-semibold mb-4">Pickup Density</h3>
          <div className="h-[420px]">
            <DataState data={data} loading={loading} error={error} onRetry={refetch} isEmpty={(d) => d.length === 0}>
              {(d) => <HotspotMap hotspots={d} />}
            </DataState>
          </div>
        </div>

        <div className="xl:col-span-2 rounded-xl p-5 bg-white border border-border">
          <h3 className="text-sm font-semibold mb-4">Top Pickup Zones</h3>
          <DataState data={data} loading={loading} error={error} onRetry={refetch} isEmpty={(d) => d.length === 0}>
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
