import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Trip } from "../types";

export function TripsTable({ trips }: { trips: Trip[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-sub">
            {["Trip ID", "Driver", "Passengers", "Fare", "Duration", "Rating", "Pickup", "Dropoff", "Timestamp"].map((h) => (
              <th key={h} className="text-left font-medium pb-2 text-xs border-b border-border whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trips.map((t) => (
            <tr key={t.trip_id} className="hover:bg-paper">
              <td className="py-2.5 pr-4 border-b border-border">
                <Link to={`/trips/${t.trip_id}`} className="font-mono text-accent hover:underline">
                  #{t.trip_id}
                </Link>
              </td>
              <td className="py-2.5 pr-4 border-b border-border font-mono text-ink">{t.driver_id}</td>
              <td className="py-2.5 pr-4 border-b border-border font-mono text-sub">{t.passenger_count}</td>
              <td className="py-2.5 pr-4 border-b border-border font-mono text-ink">${t.fare.toFixed(2)}</td>
              <td className="py-2.5 pr-4 border-b border-border font-mono text-sub">{t.duration} min</td>
              <td className="py-2.5 pr-4 border-b border-border">
                <span className="inline-flex items-center gap-1 font-mono">
                  <Star size={12} fill="#C9861A" color="#C9861A" />
                  {t.rating.toFixed(1)}
                </span>
              </td>
              <td className="py-2.5 pr-4 border-b border-border text-xs text-sub whitespace-nowrap">
                {t.pickup_location.coordinates[1].toFixed(3)}, {t.pickup_location.coordinates[0].toFixed(3)}
              </td>
              <td className="py-2.5 pr-4 border-b border-border text-xs text-sub whitespace-nowrap">
                {t.dropoff_location.coordinates[1].toFixed(3)}, {t.dropoff_location.coordinates[0].toFixed(3)}
              </td>
              <td className="py-2.5 border-b border-border text-xs text-faint whitespace-nowrap">
                {new Date(t.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
