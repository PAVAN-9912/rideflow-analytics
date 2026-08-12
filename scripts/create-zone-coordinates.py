import json
import shapefile
from shapely.geometry import shape
from pyproj import CRS, Transformer

SHP_PATH = "data/taxi_zones/taxi_zones/taxi_zones.shp"
OUTPUT_PATH = "data/taxi_zone_coordinates.json"

# Read shapefile
reader = shapefile.Reader(SHP_PATH)

# Read CRS from the .prj file
with open("data/taxi_zones/taxi_zones/taxi_zones.prj", "r", encoding="utf-8") as f:
    wkt = f.read()

source_crs = CRS.from_wkt(wkt)
target_crs = CRS.from_epsg(4326)

transformer = Transformer.from_crs(
    source_crs,
    target_crs,
    always_xy=True
)

# Find field indexes
field_names = [field.name for field in reader.fields[1:]]

location_id_index = field_names.index("LocationID")
zone_index = field_names.index("zone")
borough_index = field_names.index("borough")

result = {}

for record, shp in zip(reader.records(), reader.shapes()):
    location_id = int(record[location_id_index])
    zone = record[zone_index]
    borough = record[borough_index]

    polygon = shape(shp.__geo_interface__)

    # A point guaranteed to be inside the polygon
    point = polygon.representative_point()

    longitude, latitude = transformer.transform(
        point.x,
        point.y
    )

    result[str(location_id)] = {
        "location_id": location_id,
        "zone": zone,
        "borough": borough,
        "longitude": longitude,
        "latitude": latitude
    }

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2)

print(f"Created {len(result)} taxi-zone coordinate mappings.")
print(f"Saved to: {OUTPUT_PATH}")