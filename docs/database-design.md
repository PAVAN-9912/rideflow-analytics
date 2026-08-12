# Database Design

## Collection: `trips` (database: `ride_sharing_db`)

| Field | Type | Notes |
|---|---|---|
| `trip_id` | Number | Unique, indexed |
| `driver_id` | String | Indexed |
| `passenger_count` | Number | 1–8 |
| `pickup_location` | GeoJSON Point | `coordinates: [lng, lat]`, 2dsphere indexed |
| `dropoff_location` | GeoJSON Point | `coordinates: [lng, lat]` |
| `fare` | Number | >= 0, indexed |
| `duration` | Number | Minutes, >= 0 |
| `rating` | Number | 1–5 |
| `timestamp` | Date | Indexed descending (recent-first queries) |

## Indexes

```js
db.trips.createIndex({ trip_id: 1 }, { unique: true });
db.trips.createIndex({ driver_id: 1 });
db.trips.createIndex({ fare: 1 });
db.trips.createIndex({ timestamp: -1 });
db.trips.createIndex({ pickup_location: "2dsphere" });
```

All of these are declared directly on the Mongoose schema
(`server/src/models/Trip.ts`) so they're created automatically the first time
the app connects — no manual `mongosh` step required, though running
`Trip.init()` explicitly (as the import script does) is worth doing before a
large bulk load so the index isn't built retroactively over 50k+ documents.

## Why a coarse-grid `$group` for hotspots, not a `zones` collection

`getPickupHotspots` (in `analytics.service.ts`) buckets pickups by rounding
their coordinates to 2 decimal places (~1.1km cells) and grouping. This avoids
maintaining a separate polygon/zone collection while still producing
meaningful "busiest area" clusters directly from the indexed data. A future
iteration could swap this for `$geoNear` against a real `zones` polygon
collection with `$geoWithin` if administrative neighborhood boundaries matter.
