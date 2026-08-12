# API Documentation

Base URL: `http://localhost:5000/api`

All list endpoints return JSON. Errors return `{ "error": "message" }` with an
appropriate 4xx/5xx status; validation errors additionally return a `details`
array of `{ field, message }`.

## GET /dashboard
Returns `{ stats, recentTrips, topDrivers, hotspots }` — one call for the whole dashboard.

## GET /trips
Query params: `page`, `limit` (max 100), `driver_id`, `minFare`, `maxFare`,
`minRating`, `passengerCount`, `from`, `to`, `hour`, `sortBy`
(`timestamp|fare|duration|rating`), `sortDir` (`asc|desc`).
Returns `{ items, pagination: { page, limit, total, totalPages } }`.

## GET /trips/:id
Returns a single trip document, or 404.

## GET /trips/nearby
Query params: `lat`, `lng`, `radius` (meters, 50–50000, default 1000).
Runs a `$geoNear` aggregation against the `pickup_location` 2dsphere index.
Returns `{ origin, radiusMeters, count, trips: [{ ...trip, distanceMeters }] }`.

## GET /analytics/fare-by-hour
Same filter params as `/trips` (minus pagination). Returns
`[{ hour, avgFare, tripCount }]` for hours 0–23 that have data.

## GET /analytics/hotspots
Filter params plus `minTrips`. Returns up to 50 pickup clusters:
`[{ latitude, longitude, tripCount, avgFare }]`, sorted busiest first.

## GET /analytics/fare-distribution
Returns a fixed-bucket histogram: `[{ _id: <lower bound or "100+">, count }]`.

## GET /analytics/trip-duration
Duration histogram, same shape as fare-distribution.

## GET /analytics/passengers
Returns `[{ passengerCount, count }]`.

## GET /analytics/rating-distribution
Returns `[{ rating, count }]`, rating rounded to the nearest 0.5.

## GET /analytics/trips-by-hour
Returns `[{ hour, count }]` — trip volume rather than fare.

## GET /drivers
Query params: `sortBy` (`trips|rating|fare`), `sortDir`.
Returns `{ summary: { totalDrivers, avgRating, avgTripsPerDriver, topDriverRating }, drivers: [...] }`.

## GET /drivers/top
Query params: `limit` (default 5). Returns the top drivers by rating.
