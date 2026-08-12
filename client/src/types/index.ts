export interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface Trip {
  trip_id: number;
  driver_id: string;
  passenger_count: number;
  pickup_location: GeoPoint;
  dropoff_location: GeoPoint;
  fare: number;
  duration: number;
  rating: number;
  timestamp: string;
}

export interface NearbyTrip extends Trip {
  distanceMeters: number;
}

export interface TripStats {
  totalTrips: number;
  avgFare: number;
  avgDuration: number;
  avgRating: number;
  totalRevenue: number;
}

export interface DriverSummary {
  driver_id: string;
  totalTrips: number;
  avgRating: number;
  avgFare: number;
  avgDuration: number;
}

export interface Hotspot {
  longitude: number;
  latitude: number;
  tripCount: number;
  avgFare: number;
}

export interface DashboardSummary {
  stats: TripStats;
  recentTrips: Trip[];
  topDrivers: DriverSummary[];
  hotspots: Hotspot[];
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface FareByHourPoint {
  hour: number;
  avgFare: number;
  tripCount: number;
}
