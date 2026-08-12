import { useState } from "react";
import { Navigation } from "lucide-react";
import { api, ApiError } from "../services/api";
import { TripMap } from "../maps/TripMap";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import type { NearbyTrip } from "../types";

const radiusOptions = [
  { label: "500 m", value: 500 },
  { label: "1 km", value: 1000 },
  { label: "2 km", value: 2000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
];

export function NearbyTrips() {
  const [lat, setLat] = useState("40.7484");
  const [lng, setLng] = useState("-73.9857");
  const [radius, setRadius] = useState(1000);
  const [state, setState] = useState<{ loading: boolean; error: string | null; trips: NearbyTrip[] | null }>({
    loading: false,
    error: null,
    trips: null,
  });

  async function search() {
    setState({ loading: true, error: null, trips: null });
    try {
      const result = await api.getNearbyTrips(Number(lat), Number(lng), radius);
      setState({ loading: false, error: null, trips: result.trips });
    } catch (err) {
      setState({ loading: false, error: err instanceof ApiError ? err.message : "Search failed", trips: null });
    }
  }

  return (
    <div>
      <div className="rounded-xl p-5 bg-white border border-border mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <label className="text-xs text-sub flex flex-col gap-1">
            Latitude
            <input value={lat} onChange={(e) => setLat(e.target.value)} className="rounded-lg px-3 py-2 text-sm bg-paper border border-border" />
          </label>
          <label className="text-xs text-sub flex flex-col gap-1">
            Longitude
            <input value={lng} onChange={(e) => setLng(e.target.value)} className="rounded-lg px-3 py-2 text-sm bg-paper border border-border" />
          </label>
          <label className="text-xs text-sub flex flex-col gap-1">
            Search radius
            <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="rounded-lg px-3 py-2 text-sm bg-paper border border-border">
              {radiusOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={search}
            className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-accent text-white h-[38px]"
          >
            <Navigation size={14} /> Find Nearby Trips
          </button>
        </div>
      </div>

      {state.loading && <LoadingState rows={3} />}
      {state.error && <ErrorState message={state.error} onRetry={search} />}
      {!state.loading && !state.error && state.trips && state.trips.length === 0 && (
        <EmptyState title="No trips found in this radius" hint="Try a larger search radius or a different location." />
      )}

      {!state.loading && state.trips && state.trips.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-3 rounded-xl p-5 bg-white border border-border">
            <h3 className="text-sm font-semibold mb-4">Results on Map</h3>
            <div className="h-[420px]">
              <TripMap origin={{ lat: Number(lat), lng: Number(lng) }} trips={state.trips} />
            </div>
          </div>
          <div className="xl:col-span-2 rounded-xl p-5 bg-white border border-border overflow-x-auto">
            <h3 className="text-sm font-semibold mb-4">{state.trips.length} Trips Found</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-sub">
                  {["Trip", "Driver", "Distance", "Fare", "Rating"].map((h) => (
                    <th key={h} className="text-left font-medium pb-2 text-xs border-b border-border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.trips.map((t) => (
                  <tr key={t.trip_id}>
                    <td className="py-2 border-b border-border font-mono text-ink text-xs">#{t.trip_id}</td>
                    <td className="py-2 border-b border-border font-mono text-ink text-xs">{t.driver_id}</td>
                    <td className="py-2 border-b border-border font-mono text-sub text-xs">{t.distanceMeters} m</td>
                    <td className="py-2 border-b border-border font-mono text-ink text-xs">${t.fare.toFixed(2)}</td>
                    <td className="py-2 border-b border-border font-mono text-ink text-xs">{t.rating.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
