import { Schema, model } from "mongoose";
import { TripDocument } from "./types";

const GeoPointSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], required: true, default: "Point" },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: (coords: number[]) =>
          coords.length === 2 &&
          coords[0] >= -180 &&
          coords[0] <= 180 &&
          coords[1] >= -90 &&
          coords[1] <= 90,
        message: "coordinates must be [longitude, latitude] within valid ranges",
      },
    },
  },
  { _id: false }
);

const TripSchema = new Schema<TripDocument>(
  {
    trip_id: { type: Number, required: true, unique: true, index: true },
    driver_id: { type: String, required: true, index: true },
    passenger_count: { type: Number, required: true, min: 1, max: 8 },
    pickup_location: { type: GeoPointSchema, required: true },
    dropoff_location: { type: GeoPointSchema, required: true },
    fare: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 0 }, // minutes
    rating: { type: Number, required: true, min: 1, max: 5 },
    timestamp: { type: Date, required: true, index: true },
  },
  { collection: "trips", timestamps: false, versionKey: false }
);

// Geospatial index - required for $near / $geoNear nearby-trip search
TripSchema.index({ pickup_location: "2dsphere" });
// Supports fare-range / analytics filtering without full collection scans
TripSchema.index({ fare: 1 });
TripSchema.index({ timestamp: -1 });

export const Trip = model<TripDocument>("Trip", TripSchema);
