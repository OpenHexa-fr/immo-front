"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

export interface MapMarker {
  id: string;
  lat: number;
  lon: number;
  label: string;
  price?: string | null;
  rank?: 1 | 2 | 3 | null;
}

interface LeafletMapInnerProps {
  markers: MapMarker[];
  activeId?: string | null;
  zoom?: number;
}

const FRANCE_CENTER: [number, number] = [46.6, 2.2];

function FlyToActiveMarker({
  markers,
  activeId,
}: {
  markers: MapMarker[];
  activeId?: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!activeId) return;
    const marker = markers.find((item) => item.id === activeId);
    if (marker) {
      map.flyTo([marker.lat, marker.lon], Math.max(map.getZoom(), 14), { duration: 0.5 });
    }
  }, [activeId, markers, map]);

  return null;
}

function buildPriceIcon(marker: MapMarker, active: boolean): L.DivIcon {
  const classes = ["marker-pin"];
  if (marker.rank) classes.push(`marker-pin--rank-${marker.rank}`);
  if (active) classes.push("marker-pin--active");
  const badge = marker.rank ? `<span class="marker-pin__badge">${marker.rank}</span>` : "";
  const content = marker.price ?? "•";

  return L.divIcon({
    className: "marker-pin-icon",
    html: `<span class="${classes.join(" ")}">${badge}${content}</span>`,
    iconAnchor: [0, 0],
  });
}

export default function LeafletMapInner({ markers, activeId, zoom = 13 }: LeafletMapInnerProps) {
  const center: [number, number] = markers.length ? [markers[0].lat, markers[0].lon] : FRANCE_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={markers.length ? zoom : 5}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToActiveMarker markers={markers} activeId={activeId} />
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lon]}
          icon={buildPriceIcon(marker, marker.id === activeId)}
          zIndexOffset={marker.id === activeId ? 500 : marker.rank ? 200 : 0}
        >
          <Popup>{marker.label}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
