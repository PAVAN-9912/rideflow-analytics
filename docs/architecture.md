# Architecture

## Overview

RideFlow Analytics is a three-tier app: a React SPA, an Express REST API, and
MongoDB. The frontend never touches MongoDB directly and never recomputes
analytics over a full result set — every chart/map is backed by a purpose-built
aggregation pipeline or geospatial query on the server.

```
React SPA  --fetch-->  Express API  --Mongoose-->  MongoDB (ride_sharing_db.trips)
```

## Request flow

`routes/*.routes.ts` -> `controllers/*.controller.ts` (parses/validates query
params with Zod, calls a service, shapes the HTTP response) -> `services/*.service.ts`
(owns the Mongoose queries and aggregation pipelines) -> `models/Trip.ts`.

Controllers never build aggregation pipelines directly, and services never
touch `req`/`res` — this keeps the aggregation logic unit-testable independent
of Express.

## Frontend structure

- `pages/` — one file per route, composes charts/maps/tables and owns page-level filter state.
- `charts/`, `maps/`, `tables/` — presentational, receive already-fetched data as props.
- `services/api.ts` — the only place that knows the API's base URL and endpoint shapes.
- `hooks/useFetch.ts` + `components/DataState.tsx` — the shared loading/empty/error/retry pattern every page uses.

## Local verification checklist

Run this after `npm install` + `npm run dev` in both `server/` and `client/`,
with `MONGODB_URI` pointed at a running MongoDB instance and at least one
batch of trips imported via `scripts/import-data`:

1. `GET http://localhost:5000/health` returns `{ status: "ok" }`.
2. Dashboard loads KPI numbers, hotspot map, fare-by-hour chart, top drivers, recent trips.
3. Trip Analytics filters actually change every chart's data.
4. Demand Hotspots map renders density circles; Top Pickup Zones percentages sum sensibly.
5. Nearby Trips returns results for a known pickup-dense coordinate and an appropriate radius; distances look plausible.
6. Drivers leaderboard re-sorts when the sort dropdown changes.
7. Trips table paginates, filters, and each row links to a working Trip Details page.
8. Killing the backend and reloading a page shows the error state with a working Retry button, not a blank screen.
9. Resize to a mobile width — sidebar collapses, tables scroll horizontally, grids stack to one column.
