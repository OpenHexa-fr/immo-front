"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

// Le bundler de Next.js ne résout pas les images d'icônes par défaut de Leaflet :
// sans ce correctif, les marqueurs s'affichent sans icône.
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface MapMarker {
  id: string;
  lat: number;
  lon: number;
  label: string;
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

export default function LeafletMapInner({ markers, activeId, zoom = 13 }: LeafletMapInnerProps) {
  const center: [number, number] = markers.length
    ? [markers[0].lat, markers[0].lon]
    : FRANCE_CENTER;

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
        <Marker key={marker.id} position={[marker.lat, marker.lon]}>
          <Popup>{marker.label}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
