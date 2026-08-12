import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { DataState } from "../components/DataState";
import { FareByHourChart } from "../charts/FareByHourChart";
import { DistributionChart } from "../charts/DistributionChart";

interface Filters {
  from: string;
  to: string;
  hour: string;
  passengerCount: string;
  minFare: string;
  maxFare: string;
  minRating: string;
}

const emptyFilters: Filters = { from: "", to: "", hour: "", passengerCount: "", minFare: "", maxFare: "", minRating: "" };

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5 bg-white border border-border">
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      <div style={{ height: 220 }}>{children}</div>
    </div>
  );
}

export function TripAnalytics() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters>(emptyFilters);

  const params = {
    from: applied.from || undefined,
    to: applied.to || undefined,
    hour: applied.hour || undefined,
    passengerCount: applied.passengerCount || undefined,
    minFare: applied.minFare || undefined,
    maxFare: applied.maxFare || undefined,
    minRating: applied.minRating || undefined,
  };

  const fareByHour = useFetch(() => api.getFareByHour(params), [JSON.stringify(params)]);
  const fareDist = useFetch(() => api.getFareDistribution(params), [JSON.stringify(params)]);
  const durationDist = useFetch(() => api.getTripDuration(params), [JSON.stringify(params)]);
  const passengerDist = useFetch(() => api.getPassengerDistribution(params), [JSON.stringify(params)]);
  const tripsByHour = useFetch(() => api.getTripsByHour(params), [JSON.stringify(params)]);
  const ratingDist = useFetch(() => api.getRatingDistribution(params), [JSON.stringify(params)]);

  const field = (key: keyof Filters, placeholder: string, type = "text") => (
    <input
      type={type}
      placeholder={placeholder}
      value={filters[key]}
      onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}
      className="rounded-lg px-3 py-2 text-sm bg-paper border border-border outline-none focus:border-accent w-full"
    />
  );

  return (
    <div>
      <div className="rounded-xl p-4 bg-white border border-border mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
          {field("from", "From date", "date")}
          {field("to", "To date", "date")}
          {field("hour", "Hour (0-23)", "number")}
          {field("passengerCount", "Passengers", "number")}
          {field("minFare", "Min fare", "number")}
          {field("maxFare", "Max fare", "number")}
          {field("minRating", "Min rating", "number")}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setApplied(filters)}
            className="rounded-lg px-4 py-2 text-sm font-medium bg-accent text-white"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              setFilters(emptyFilters);
              setApplied(emptyFilters);
            }}
            className="rounded-lg px-4 py-2 text-sm font-medium bg-paper border border-border text-sub"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Average Fare by Hour">
          <DataState {...fareByHour} onRetry={fareByHour.refetch} isEmpty={(d) => d.length === 0}>
            {(d) => <FareByHourChart data={d} />}
          </DataState>
        </ChartCard>

        <ChartCard title="Trips by Hour">
          <DataState {...tripsByHour} onRetry={tripsByHour.refetch} isEmpty={(d: any[]) => d.length === 0}>
            {(d: any[]) => <DistributionChart data={d} xKey="hour" yKey="count" color="#0F9E8E" formatX={(h) => `${String(h).padStart(2, "0")}:00`} />}
          </DataState>
        </ChartCard>

        <ChartCard title="Fare Distribution">
          <DataState {...fareDist} onRetry={fareDist.refetch} isEmpty={(d: any[]) => d.length === 0}>
            {(d: any[]) => <DistributionChart data={d} xKey="_id" yKey="count" color="#3160EE" />}
          </DataState>
        </ChartCard>

        <ChartCard title="Trip Duration Distribution">
          <DataState {...durationDist} onRetry={durationDist.refetch} isEmpty={(d: any[]) => d.length === 0}>
            {(d: any[]) => <DistributionChart data={d} xKey="_id" yKey="count" color="#C9861A" />}
          </DataState>
        </ChartCard>

        <ChartCard title="Passenger Count Distribution">
          <DataState {...passengerDist} onRetry={passengerDist.refetch} isEmpty={(d: any[]) => d.length === 0}>
            {(d: any[]) => <DistributionChart data={d} xKey="passengerCount" yKey="count" color="#3160EE" />}
          </DataState>
        </ChartCard>

        <ChartCard title="Rating Distribution">
          <DataState {...ratingDist} onRetry={ratingDist.refetch} isEmpty={(d: any[]) => d.length === 0}>
            {(d: any[]) => <DistributionChart data={d} xKey="rating" yKey="count" color="#D3453D" />}
          </DataState>
        </ChartCard>
      </div>
    </div>
  );
}
