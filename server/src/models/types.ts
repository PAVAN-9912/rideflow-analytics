export interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude] - GeoJSON order, never reversed
}

export interface TripDocument {
  trip_id: number;
  driver_id: string;
  passenger_count: number;
  pickup_location: GeoPoint;
  dropoff_location: GeoPoint;
  fare: number;
  duration: number; // minutes
  rating: number;
  timestamp: Date;
}
