import csv
import json
from datetime import datetime

import pyarrow.parquet as pq


INPUT_FILE = "data/yellow_tripdata_2025-01.parquet"
ZONE_FILE = "data/taxi_zone_coordinates.json"
OUTPUT_FILE = "data/rideflow_trips_100k.csv"

TARGET_ROWS = 100_000
BATCH_SIZE = 100_000


def load_zone_coordinates():
    with open(ZONE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def parse_timestamp(value):
    if value is None:
        return None

    if isinstance(value, datetime):
        return value

    try:
        return value.to_pydatetime()
    except AttributeError:
        return None


def deterministic_rating(trip_id):
    # Generates a stable rating between 4.0 and 5.0.
    # The same trip_id always gets the same rating.
    return round(4.0 + ((trip_id * 37) % 101) / 100, 2)


def deterministic_driver_id(trip_id):
    # Creates a stable synthetic driver ID.
    driver_number = 1000 + ((trip_id * 17) % 1000)
    return f"D{driver_number}"


def main():
    zones = load_zone_coordinates()

    parquet = pq.ParquetFile(INPUT_FILE)

    output_fields = [
        "trip_id",
        "driver_id",
        "passenger_count",
        "pickup_lat",
        "pickup_lng",
        "dropoff_lat",
        "dropoff_lng",
        "fare",
        "duration",
        "rating",
        "timestamp",
    ]

    selected = 0
    scanned = 0
    skipped = 0

    with open(
        OUTPUT_FILE,
        "w",
        newline="",
        encoding="utf-8",
    ) as output_file:

        writer = csv.DictWriter(
            output_file,
            fieldnames=output_fields,
        )

        writer.writeheader()

        for batch_number, batch in enumerate(
            parquet.iter_batches(
                batch_size=BATCH_SIZE,
                columns=[
                    "tpep_pickup_datetime",
                    "tpep_dropoff_datetime",
                    "passenger_count",
                    "PULocationID",
                    "DOLocationID",
                    "fare_amount",
                ],
            ),
            start=1,
        ):

            rows = batch.to_pylist()

            print(
                f"Processing batch {batch_number} "
                f"({len(rows):,} rows)..."
            )

            for row in rows:
                scanned += 1

                pickup_id = row.get("PULocationID")
                dropoff_id = row.get("DOLocationID")

                if pickup_id is None or dropoff_id is None:
                    skipped += 1
                    continue

                pickup_zone = zones.get(str(int(pickup_id)))
                dropoff_zone = zones.get(str(int(dropoff_id)))

                if pickup_zone is None or dropoff_zone is None:
                    skipped += 1
                    continue

                pickup_time = parse_timestamp(
                    row.get("tpep_pickup_datetime")
                )

                dropoff_time = parse_timestamp(
                    row.get("tpep_dropoff_datetime")
                )

                if pickup_time is None or dropoff_time is None:
                    skipped += 1
                    continue

                duration_seconds = (
                    dropoff_time - pickup_time
                ).total_seconds()

                duration_minutes = duration_seconds / 60

                if duration_minutes <= 0 or duration_minutes > 300:
                    skipped += 1
                    continue

                passenger_count = row.get("passenger_count")

                if passenger_count is None:
                    skipped += 1
                    continue

                passenger_count = int(passenger_count)

                if passenger_count < 1 or passenger_count > 8:
                    skipped += 1
                    continue

                fare = row.get("fare_amount")

                if fare is None:
                    skipped += 1
                    continue

                fare = float(fare)

                if fare < 0:
                    skipped += 1
                    continue

                trip_id = scanned

                writer.writerow(
                    {
                        "trip_id": trip_id,
                        "driver_id": deterministic_driver_id(
                            trip_id
                        ),
                        "passenger_count": passenger_count,
                        "pickup_lat": pickup_zone["latitude"],
                        "pickup_lng": pickup_zone["longitude"],
                        "dropoff_lat": dropoff_zone["latitude"],
                        "dropoff_lng": dropoff_zone["longitude"],
                        "fare": round(fare, 2),
                        "duration": round(
                            duration_minutes,
                            2,
                        ),
                        "rating": deterministic_rating(
                            trip_id
                        ),
                        "timestamp": pickup_time.isoformat(),
                    }
                )

                selected += 1

                if selected % 10_000 == 0:
                    print(
                        f"  Selected: {selected:,} | "
                        f"Scanned: {scanned:,} | "
                        f"Skipped: {skipped:,}"
                    )

                if selected >= TARGET_ROWS:
                    break

            if selected >= TARGET_ROWS:
                break

    print()
    print("Preprocessing complete.")
    print(f"Scanned:  {scanned:,}")
    print(f"Selected: {selected:,}")
    print(f"Skipped:  {skipped:,}")
    print(f"Output:   {OUTPUT_FILE}")


if __name__ == "__main__":
    main()