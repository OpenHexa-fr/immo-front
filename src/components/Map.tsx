"use client";

import dynamic from "next/dynamic";

import type { MapMarker } from "./LeafletMapInner";

// Leaflet accède à `window` au chargement du module : le rendu SSR doit être désactivé.
const LeafletMapInner = dynamic(() => import("./LeafletMapInner"), { ssr: false });

interface MapProps {
  markers: MapMarker[];
  zoom?: number;
}

export function Map({ markers, zoom }: MapProps) {
  return (
    <div style={{ height: "400px", width: "100%" }}>
      <LeafletMapInner markers={markers} zoom={zoom} />
    </div>
  );
}
