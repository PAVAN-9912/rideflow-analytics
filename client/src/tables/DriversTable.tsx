import { Star } from "lucide-react";
import type { DriverSummary } from "../types";

export function DriversTable({ drivers }: { drivers: DriverSummary[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-sub">
            {["Rank", "Driver ID", "Total Trips", "Avg Rating", "Avg Fare", "Avg Duration", "Performance"].map((h) => (
              <th key={h} className="text-left font-medium pb-2 text-xs border-b border-border">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {drivers.map((d, i) => (
            <tr key={d.driver_id} className="hover:bg-paper">
              <td className="py-2.5 border-b border-border text-sub">{i + 1}</td>
              <td className="py-2.5 border-b border-border font-mono text-ink">{d.driver_id}</td>
              <td className="py-2.5 border-b border-border font-mono text-ink">{d.totalTrips}</td>
              <td className="py-2.5 border-b border-border">
                <span className="inline-flex items-center gap-1 font-mono">
                  <Star size={12} fill="#C9861A" color="#C9861A" />
                  {d.avgRating.toFixed(2)}
                </span>
              </td>
              <td className="py-2.5 border-b border-border font-mono text-ink">${d.avgFare.toFixed(2)}</td>
              <td className="py-2.5 border-b border-border font-mono text-sub">{d.avgDuration.toFixed(1)} min</td>
              <td className="py-2.5 border-b border-border">
                <div className="w-24 h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${Math.min(100, (d.avgRating / 5) * 100)}%` }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
