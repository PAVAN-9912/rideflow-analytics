import type {
  DashboardSummary,
  DriverSummary,
  FareByHourPoint,
  Hotspot,
  NearbyTrip,
  PaginatedResult,
  Trip,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const url = new URL(BASE_URL + path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status);
  }
  return res.json();
}

export const api = {
  getDashboard: () => request<DashboardSummary>("/dashboard"),

  getTrips: (params: Record<string, unknown>) => request<PaginatedResult<Trip>>("/trips", params),
  getTrip: (id: number) => request<Trip>(`/trips/${id}`),
  getNearbyTrips: (lat: number, lng: number, radius: number) =>
    request<{ trips: NearbyTrip[]; count: number }>("/trips/nearby", { lat, lng, radius }),

  getFareByHour: (params?: Record<string, unknown>) =>
    request<FareByHourPoint[]>("/analytics/fare-by-hour", params),
  getHotspots: (params?: Record<string, unknown>) => request<Hotspot[]>("/analytics/hotspots", params),
  getFareDistribution: (params?: Record<string, unknown>) =>
    request<unknown[]>("/analytics/fare-distribution", params),
  getTripDuration: (params?: Record<string, unknown>) =>
    request<unknown[]>("/analytics/trip-duration", params),
  getPassengerDistribution: (params?: Record<string, unknown>) =>
    request<unknown[]>("/analytics/passengers", params),
  getRatingDistribution: (params?: Record<string, unknown>) =>
    request<unknown[]>("/analytics/rating-distribution", params),
  getTripsByHour: (params?: Record<string, unknown>) =>
    request<unknown[]>("/analytics/trips-by-hour", params),

  getDrivers: (params?: Record<string, unknown>) =>
    request<{ summary: unknown; drivers: DriverSummary[] }>("/drivers", params),
  getTopDrivers: (limit = 5) => request<DriverSummary[]>("/drivers/top", { limit }),
};
