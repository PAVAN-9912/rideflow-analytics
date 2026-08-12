import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { DataState } from "../components/DataState";
import { TripsTable } from "../tables/TripsTable";

export function Trips() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState({ driver_id: "", minFare: "", maxFare: "", minRating: "", from: "", to: "" });

  const params = { page, limit: 20, ...search, driver_id: search.driver_id || undefined };
  const { data, loading, error, refetch } = useFetch(() => api.getTrips(params), [page, JSON.stringify(search)]);

  const field = (key: keyof typeof search, placeholder: string, type = "text") => (
    <input
      type={type}
      placeholder={placeholder}
      value={search[key]}
      onChange={(e) => {
        setPage(1);
        setSearch((s) => ({ ...s, [key]: e.target.value }));
      }}
      className="rounded-lg px-3 py-2 text-sm bg-paper border border-border w-full"
    />
  );

  return (
    <div>
      <div className="rounded-xl p-4 bg-white border border-border mb-6 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {field("driver_id", "Driver ID")}
        {field("minFare", "Min fare", "number")}
        {field("maxFare", "Max fare", "number")}
        {field("minRating", "Min rating", "number")}
        {field("from", "From date", "date")}
        {field("to", "To date", "date")}
      </div>

      <div className="rounded-xl p-5 bg-white border border-border">
        <DataState data={data} loading={loading} error={error} onRetry={refetch} isEmpty={(d: any) => d.items.length === 0}>
          {(d: any) => (
            <>
              <TripsTable trips={d.items} />
              <div className="flex items-center justify-between mt-4 text-xs text-sub">
                <span>
                  Page {d.pagination.page} of {d.pagination.totalPages} · {d.pagination.total} trips
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg px-3 py-1.5 border border-border disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= d.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg px-3 py-1.5 border border-border disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </DataState>
      </div>
    </div>
  );
}
