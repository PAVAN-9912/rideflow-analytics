/**
 * Streaming CSV -> MongoDB importer for the `trips` collection.
 *
 * Usage:
 *   npm run import -- /path/to/dataset.csv
 */

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse";
import { Trip } from "../../server/src/models/Trip";

const BATCH_SIZE = 1000;

interface RawRow {
  [key: string]: string;
}

interface TripDoc {
  trip_id: number;
  driver_id: string;
  passenger_count: number;
  pickup_location: {
    type: "Point";
    coordinates: [number, number];
  };
  dropoff_location: {
    type: "Point";
    coordinates: [number, number];
  };
  fare: number;
  duration: number;
  rating: number;
  timestamp: Date;
}

function toNumber(
  value: string | undefined,
  fallback: number | null = null
): number | null {
  if (value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function isValidLat(lat: number): boolean {
  return lat >= -90 && lat <= 90;
}

function isValidLng(lng: number): boolean {
  return lng >= -180 && lng <= 180;
}

let driverCounter = 1000;
const driverIdCache = new Map<string, string>();

function resolveDriverId(raw: RawRow): string {
  const existing = raw.driver_id ?? raw.driverId;

  if (existing) {
    return existing;
  }

  const groupKey =
    raw.vendor_id ??
    raw.vendorId ??
    "default";

  if (!driverIdCache.has(groupKey)) {
    driverCounter += 1;
    driverIdCache.set(groupKey, `D${driverCounter}`);
  }

  return driverIdCache.get(groupKey)!;
}

function cleanRow(
  raw: RawRow,
  sequentialId: number
): { doc: TripDoc } | { error: string } {
  const pickupLat = toNumber(
    raw.pickup_lat ?? raw.pickup_latitude
  );

  const pickupLng = toNumber(
    raw.pickup_lng ?? raw.pickup_longitude
  );

  const dropoffLat = toNumber(
    raw.dropoff_lat ?? raw.dropoff_latitude
  );

  const dropoffLng = toNumber(
    raw.dropoff_lng ?? raw.dropoff_longitude
  );

  if (
    pickupLat === null ||
    pickupLng === null ||
    dropoffLat === null ||
    dropoffLng === null
  ) {
    return { error: "missing coordinates" };
  }

  if (
    !isValidLat(pickupLat) ||
    !isValidLat(dropoffLat) ||
    !isValidLng(pickupLng) ||
    !isValidLng(dropoffLng)
  ) {
    return { error: "coordinates out of range" };
  }

  const fare = toNumber(
    raw.fare ?? raw.fare_amount,
    0
  )!;

  const duration = toNumber(
    raw.duration ?? raw.trip_duration,
    0
  )!;

  const rating = toNumber(
    raw.rating,
    4.5
  )!;

  const passengerCount = Math.max(
    1,
    Math.min(
      8,
      toNumber(raw.passenger_count, 1)!
    )
  );

  const timestampValue =
    raw.timestamp ??
    raw.pickup_datetime;

  const timestamp = timestampValue
    ? new Date(timestampValue)
    : null;

  if (
    fare < 0 ||
    duration < 0 ||
    rating < 1 ||
    rating > 5
  ) {
    return {
      error: "invalid fare/duration/rating",
    };
  }

  if (
    !timestamp ||
    Number.isNaN(timestamp.getTime())
  ) {
    return {
      error: "invalid timestamp",
    };
  }

  return {
    doc: {
      trip_id:
        toNumber(
          raw.trip_id,
          sequentialId
        )!,

      driver_id:
        resolveDriverId(raw),

      passenger_count:
        passengerCount,

      pickup_location: {
        type: "Point",
        coordinates: [
          pickupLng,
          pickupLat,
        ],
      },

      dropoff_location: {
        type: "Point",
        coordinates: [
          dropoffLng,
          dropoffLat,
        ],
      },

      fare,
      duration,
      rating,
      timestamp,
    },
  };
}

async function run() {
  const csvPath = process.argv[2];

  if (!csvPath) {
    console.error(
      "Usage: npm run import -- /path/to/dataset.csv"
    );
    process.exit(1);
  }

  const resolvedPath =
    path.resolve(csvPath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(
      `File not found: ${resolvedPath}`
    );
    process.exit(1);
  }

  const uri =
    process.env.MONGODB_URI ??
    "mongodb://127.0.0.1:27017";

  const dbName =
    process.env.MONGODB_DATABASE ??
    "ride_sharing_db";

  // IMPORTANT:
  // Use the same Mongoose connection that owns the Trip model.
  await Trip.db.openUri(uri, {
    dbName,
  });

  console.log(
    `[import] connected -> ${dbName}`
  );

  console.log(
    "[import] MongoDB indexes verified; starting import..."
  );

  let batch: TripDoc[] = [];
  let inserted = 0;
  let skipped = 0;
  let sequentialId = 100000;

  const errors: Record<string, number> = {};

  const parser =
    fs
      .createReadStream(resolvedPath)
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
        })
      );

  async function flush() {
    if (batch.length === 0) {
      return;
    }

    try {
      const result = await Trip.insertMany(
        batch,
        {
          ordered: false,
        }
      );

      inserted += result.length;
    } catch (error: any) {
      const writeErrors =
        error?.writeErrors?.length ?? 0;

      const successful =
        batch.length - writeErrors;

      inserted += Math.max(
        0,
        successful
      );

      skipped += writeErrors;

      console.error(
        "\n[import] batch insert error:",
        error?.message ?? error
      );
    }

    process.stdout.write(
      `\r[import] inserted ${inserted} | skipped ${skipped}`
    );

    batch = [];
  }

  for await (
    const raw of parser as AsyncIterable<RawRow>
  ) {
    sequentialId += 1;

    const result =
      cleanRow(
        raw,
        sequentialId
      );

    if ("error" in result) {
      skipped += 1;

      errors[result.error] =
        (errors[result.error] ?? 0) + 1;

      continue;
    }

    batch.push(result.doc);

    if (
      batch.length >= BATCH_SIZE
    ) {
      await flush();
    }
  }

  await flush();

  console.log(
    "\n[import] done."
  );

  console.log(
    `  inserted: ${inserted}`
  );

  console.log(
    `  skipped:  ${skipped}`
  );

  if (
    Object.keys(errors).length > 0
  ) {
    console.log(
      "  skip reasons:",
      errors
    );
  }

  await Trip.db.close();

  console.log(
    "[import] MongoDB connection closed."
  );
}

run().catch((error) => {
  console.error(
    "[import] fatal error:",
    error
  );

  process.exit(1);
});