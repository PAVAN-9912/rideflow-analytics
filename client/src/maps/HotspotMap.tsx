import { CircleMarker, MapContainer, TileLayer, Tooltip as LeafletTooltip } from "react-leaflet";
import type { Hotspot } from "../types";

interface Props {
  hotspots: Hotspot[];
  center?: [number, number];
}

/** Pickup-density map: circle radius/opacity scale with trip count at that cell. */
export function HotspotMap({ hotspots, center }: Props) {
  const maxCount = Math.max(1, ...hotspots.map((h) => h.tripCount));
  const mapCenter: [number, number] = center ?? (hotspots[0] ? [hotspots[0].latitude, hotspots[0].longitude] : [40.7484, -73.9857]);

  return (
    <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={false} className="rounded-lg" style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {hotspots.map((h, i) => {
        const weight = h.tripCount / maxCount;
        return (
          <CircleMarker
            key={i}
            center={[h.latitude, h.longitude]}
            radius={6 + weight * 16}
            pathOptions={{ color: "#3160EE", fillColor: "#3160EE", fillOpacity: 0.15 + weight * 0.35, weight: 1 }}
          >
            <LeafletTooltip>
              {h.tripCount} trips · ${h.avgFare.toFixed(2)} avg fare
            </LeafletTooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
