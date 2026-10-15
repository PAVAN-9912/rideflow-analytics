import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { DataState } from "../components/DataState";
import { TripsTable } from "../tables/TripsTable";

export function Trips() {
  const [page, setPage] = useState(1);
  const emptySearch = { driver_id: "", minFare: "", maxFare: "", minRating: "", from: "", to: "" };
  const [search, setSearch] = useState(emptySearch);

  const params = {
    page,
    limit: 20,
    ...search,
    driver_id: search.driver_id || undefined,
    from: search.from || undefined,
    to: search.to ? `${search.to}T23:59:59.999Z` : undefined,
  };
  const { data, loading, error, refetch } = useFetch(() => api.getTrips(params), [page, JSON.stringify(search)]);

  const hasFilters = Object.values(search).some((v) => v !== "");

  const field = (key: keyof typeof search, placeholder: string, type = "text") => (
    <input
      type={type}
      placeholder={placeholder}
      min={type === "date" ? "2024-12-31" : undefined}
      max={type === "date" ? "2025-01-02" : undefined}
      value={search[key]}
      onChange={(e) => {
        setPage(1);
        setSearch((s) => ({ ...s, [key]: e.target.value }));
      }}
      className="rounded-lg px-3 py-2 text-sm bg-paper border border-border w-full outline-none focus:border-accent"
    />
  );

  return (
    <div>
      <div className="rounded-xl p-4 bg-white border border-border mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="text-xs text-sub">Search and paginate individual trip records across the dataset.</div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-accentsoft text-accent font-medium self-start sm:self-auto">
            Dataset Range: Dec 31, 2024 – Jan 2, 2025
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {field("driver_id", "Driver ID")}
          {field("minFare", "Min fare", "number")}
          {field("maxFare", "Max fare", "number")}
          {field("minRating", "Min rating", "number")}
          {field("from", "From date", "date")}
          {field("to", "To date", "date")}
        </div>
        {hasFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <button
              onClick={() => {
                setPage(1);
                setSearch(emptySearch);
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-medium bg-paper border border-border text-sub hover:text-ink transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl p-5 bg-white border border-border">
        <DataState
          data={data}
          loading={loading}
          error={error}
          onRetry={refetch}
          isEmpty={(d: any) => d.items.length === 0}
          emptyTitle="No trips found"
          emptyHint="Try adjusting your search criteria or date range (Dec 31, 2024 – Jan 2, 2025)."
        >
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
