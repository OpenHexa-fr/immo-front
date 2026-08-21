"use client";

import dynamic from "next/dynamic";

import type {
  CarteTier,
  DateRange,
  FlyTarget,
  LayerVisibility,
  ParcelleSelection,
  VentesEtat,
} from "./CarteMapInner";
import type { FiltresVentes } from "./FiltresVentes";
import type { Categorie } from "@/lib/api";

const CarteMapInner = dynamic(() => import("./CarteMapInner"), { ssr: false });

interface CarteMapProps {
  layers: LayerVisibility;
  onTierChange?: (tier: CarteTier) => void;
  flyTarget?: FlyTarget | null;
  venteDateRange?: DateRange;
  onSelectVente?: (selection: ParcelleSelection) => void;
  onVentesChargees?: (etat: VentesEtat | null) => void;
  filtres?: FiltresVentes;
  categorie?: Categorie;
}

export function CarteMap({
  layers,
  onTierChange,
  flyTarget,
  venteDateRange,
  onSelectVente,
  onVentesChargees,
  filtres,
  categorie,
}: CarteMapProps) {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <CarteMapInner
        layers={layers}
        onTierChange={onTierChange}
        flyTarget={flyTarget}
        venteDateRange={venteDateRange}
        onSelectVente={onSelectVente}
        onVentesChargees={onVentesChargees}
        filtres={filtres}
        categorie={categorie}
      />
    </div>
  );
}
