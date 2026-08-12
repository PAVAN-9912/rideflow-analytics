import { CircleMarker, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import type { NearbyTrip } from "../types";

// Default Leaflet marker icons reference bundler-relative asset paths that
// don't resolve under Vite without this explicit override.
const originIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:9999px;background:#3160EE;border:2px solid white;box-shadow:0 0 0 2px #3160EE55"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

interface Props {
  origin: { lat: number; lng: number };
  trips: NearbyTrip[];
}

export function TripMap({ origin, trips }: Props) {
  return (
    <MapContainer center={[origin.lat, origin.lng]} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }} className="rounded-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
        <Popup>Search origin</Popup>
      </Marker>
      {trips.map((t) => (
        <CircleMarker
          key={t.trip_id}
          center={[t.pickup_location.coordinates[1], t.pickup_location.coordinates[0]]}
          radius={7}
          pathOptions={{ color: "#0F9E8E", fillColor: "#0F9E8E", fillOpacity: 0.5, weight: 1.5 }}
        >
          <Popup>
            Trip #{t.trip_id} · {Math.round(t.distanceMeters)}m away
            <br />${t.fare.toFixed(2)} · {t.duration} min
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
