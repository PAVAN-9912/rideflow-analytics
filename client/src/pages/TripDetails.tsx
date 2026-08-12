import { useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { DataState } from "../components/DataState";
import { HotspotMap } from "../maps/HotspotMap";

export function TripDetails() {
  const { id } = useParams();
  const { data, loading, error, refetch } = useFetch(() => api.getTrip(Number(id)), [id]);

  return (
    <DataState data={data} loading={loading} error={error} onRetry={refetch}>
      {(trip) => (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-2 rounded-xl p-5 bg-white border border-border">
            <h3 className="text-sm font-semibold mb-4">Trip #{trip.trip_id}</h3>
            <dl className="flex flex-col gap-3 text-sm">
              {[
                ["Driver ID", trip.driver_id],
                ["Passengers", String(trip.passenger_count)],
                ["Fare", `$${trip.fare.toFixed(2)}`],
                ["Duration", `${trip.duration} min`],
                ["Timestamp", new Date(trip.timestamp).toLocaleString()],
                ["Pickup coordinates", trip.pickup_location.coordinates.slice().reverse().join(", ")],
                ["Dropoff coordinates", trip.dropoff_location.coordinates.slice().reverse().join(", ")],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-sub">{label}</dt>
                  <dd className="font-mono text-ink">{value}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <dt className="text-sub">Rating</dt>
                <dd className="font-mono text-ink flex items-center gap-1">
                  <Star size={12} fill="#C9861A" color="#C9861A" /> {trip.rating.toFixed(1)}
                </dd>
              </div>
            </dl>
          </div>
          <div className="xl:col-span-3 rounded-xl p-5 bg-white border border-border">
            <h3 className="text-sm font-semibold mb-4">Pickup &amp; Dropoff</h3>
            <div className="h-[360px]">
              <HotspotMap
                hotspots={[
                  { latitude: trip.pickup_location.coordinates[1], longitude: trip.pickup_location.coordinates[0], tripCount: 1, avgFare: trip.fare },
                  { latitude: trip.dropoff_location.coordinates[1], longitude: trip.dropoff_location.coordinates[0], tripCount: 1, avgFare: trip.fare },
                ]}
                center={[trip.pickup_location.coordinates[1], trip.pickup_location.coordinates[0]]}
              />
            </div>
          </div>
        </div>
      )}
    </DataState>
  );
}
