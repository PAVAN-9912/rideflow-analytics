# RideFlow Analytics

A full-stack ride-sharing trip analytics platform: React/TypeScript/Vite frontend,
Node/Express/TypeScript backend, MongoDB as the primary datastore with real
geospatial (`2dsphere` / `$geoNear`) queries and aggregation-pipeline analytics.

## Features

- **Dashboard** — KPI cards, pickup demand hotspot map, average fare by hour, top drivers, recent trips.
- **Trip Analytics** — filterable charts: fare/duration/passenger/rating distributions, trips by hour, fare by hour.
- **Demand Hotspots** — geospatial density map with a top pickup zones panel, filterable by date, hour, passenger count, and minimum trips.
- **Nearby Trips** — real `$geoNear` search by lat/lng and radius (500m–10km), results on a map and in a table with distance.
- **Drivers** — leaderboard with sortable trips/rating/fare, fleet KPI summary.
- **Trips** — searchable, filterable, paginated trip table with a detail view.
- **Trip Details** — full record plus a pickup/dropoff map.
- **Settings** — connection configuration reference.

## Technology Stack

| Layer | Stack |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, Recharts, React-Leaflet |
| Backend | Node.js, Express, TypeScript, Mongoose, Zod validation |
| Database | MongoDB (native aggregation pipelines + 2dsphere geospatial index) |
| Import tooling | Streaming CSV parser, batch bulk insert |

## Architecture

```
client/   React SPA — pages/, components/, charts/, maps/, tables/, services/api.ts
server/   Express API — routes -> controllers -> services -> Mongoose models
scripts/  Streaming CSV -> MongoDB import utility
docs/     Architecture, schema, API, and geospatial-query notes
```

The frontend never computes analytics client-side over the full dataset — every
chart and map is backed by a MongoDB aggregation pipeline or a `$geoNear` query
that returns already-summarized data.

## Database Schema

Database: `ride_sharing_db`, collection: `trips`.

```js
{
  trip_id: 100001,
  driver_id: "D1001",
  passenger_count: 2,
  pickup_location:  { type: "Point", coordinates: [-73.9857, 40.7484] }, // [lng, lat]
  dropoff_location: { type: "Point", coordinates: [-73.9712, 40.7831] },
  fare: 18.75,
  duration: 24,
  rating: 4.7,
  timestamp: ISODate("...")
}
```

Indexes: `trip_id` (unique), `driver_id`, `timestamp`, `fare`, and a `2dsphere`
index on `pickup_location` (created automatically by the Mongoose schema in
`server/src/models/Trip.ts`).

## Geospatial Implementation

Nearby-trip search runs a real `$geoNear` aggregation stage against the
`pickup_location` 2dsphere index (`server/src/services/trips.service.ts`).
Distance is computed by MongoDB, not the frontend. See `docs/geospatial-queries.md`.

## Installation

Requires Node.js 18+ and a running MongoDB instance (local or Atlas).

```bash
# 1. Backend
cd server
cp .env.example .env      # set MONGODB_URI
npm install
npm run dev                # http://localhost:5000

# 2. Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev                # http://localhost:5173

# 3. Data import (optional, once the backend's .env is configured)
cd scripts/import-data
cp ../../server/.env .env  # reuse the same MONGODB_URI
npm install
npm run import -- /path/to/your-dataset.csv
```

## Environment Variables

**server/.env**
```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=ride_sharing_db
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

**client/.env**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## API Documentation

See `docs/api-documentation.md` for the full endpoint reference. Summary:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/dashboard` | Aggregated dashboard payload |
| GET | `/api/trips` | Paginated, filtered, sorted trip list |
| GET | `/api/trips/:id` | Single trip |
| GET | `/api/trips/nearby` | Geospatial `$geoNear` search |
| GET | `/api/analytics/fare-by-hour` | Avg fare grouped by hour |
| GET | `/api/analytics/hotspots` | Pickup density clusters |
| GET | `/api/analytics/fare-distribution` | Fare histogram |
| GET | `/api/analytics/trip-duration` | Duration histogram |
| GET | `/api/analytics/passengers` | Passenger-count histogram |
| GET | `/api/analytics/rating-distribution` | Rating histogram |
| GET | `/api/analytics/trips-by-hour` | Trip volume by hour |
| GET | `/api/drivers` | Driver leaderboard + fleet summary |
| GET | `/api/drivers/top` | Top N drivers by rating |

## Testing Notes

This codebase was authored and reviewed for correctness (types, aggregation
pipeline syntax, route ordering, index definitions) but was **not executed
against a live MongoDB instance or browser** in the environment that generated
it — that environment has no network access. Before considering this done,
run through `docs/architecture.md`'s verification checklist locally: start
both servers, import a sample dataset, and click through each page listed
above, confirming charts/maps render from real data and the nearby-search
returns real `$geoNear` results.

## Screenshots

_Add screenshots here once running locally — `docs/architecture.md` has a
suggested capture list (Dashboard, Trip Analytics, Demand Hotspots, Nearby
Trips, Drivers, Trips, Trip Details)._
