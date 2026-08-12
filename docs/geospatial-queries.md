# Geospatial Query Notes

## Coordinate order

MongoDB GeoJSON requires `[longitude, latitude]`. Every place this matters is
commented in code (`models/Trip.ts`, `trips.service.ts`, the import script,
and the frontend map components) because reversing the order is the single
most common bug in geospatial features — it silently produces a valid-looking
point in the wrong hemisphere rather than an error.

## The 2dsphere index

```js
TripSchema.index({ pickup_location: "2dsphere" });
```

Declared on the Mongoose schema so it's created automatically on first
connection. Required for both `$near` and `$geoNear`.

## Nearby-trip search (`$geoNear`)

```js
Trip.aggregate([
  {
    $geoNear: {
      near: { type: "Point", coordinates: [lng, lat] },
      distanceField: "distanceMeters",
      maxDistance: radiusMeters,
      spherical: true,
      query: {},
    },
  },
  { $limit: limit },
]);
```

`$geoNear` must be the first stage in the pipeline. `spherical: true` is
required because coordinates are longitude/latitude on a sphere, not a flat
plane — omitting it silently produces wrong distances. Distance is returned in
meters directly by MongoDB (`distanceMeters`) and displayed as-is by the
frontend; the client performs no distance math of its own.

## Why aggregation, not `.find().near()`

`$geoNear` is used instead of a simple `find({ pickup_location: { $near: ... } })`
because it can return the computed distance alongside each document in one
pass, which the Nearby Trips page needs to display and sort by.
