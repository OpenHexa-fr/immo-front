"use client";

import { useState } from "react";

import { CarteLegend } from "./CarteLegend";
import { CarteMap } from "./CarteMap";
import type {
  CarteTier,
  DateRange,
  FlyTarget,
  LayerVisibility,
  ParcelleSelection,
} from "./CarteMapInner";
import { CarteSearchBar } from "./CarteSearchBar";
import { LayerSidebar } from "./LayerSidebar";
import { ParcelleDetailPanel } from "./ParcelleDetailPanel";

const DEFAULT_LAYERS: LayerVisibility = { parcelles: true, ventes: false, prixM2: true };
const DEFAULT_DATE_RANGE: DateRange = { min: "", max: "" };

export function CarteExplorer() {
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYERS);
  const [tier, setTier] = useState<CarteTier>("departement");
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);
  const [venteDateRange, setVenteDateRange] = useState<DateRange>(DEFAULT_DATE_RANGE);
  const [selectedParcelle, setSelectedParcelle] = useState<ParcelleSelection | null>(null);

  const ventesLocked = tier !== "section";

  return (
    <div className="carte-layout">
      <LayerSidebar
        layers={layers}
        onChange={setLayers}
        ventesLocked={ventesLocked}
        dateRange={venteDateRange}
        onDateRangeChange={setVenteDateRange}
      />
      <div className="carte-layout__map">
        <div className="carte-layout__search">
          <CarteSearchBar
            onLocate={(lon, lat, zoom) =>
              setFlyTarget({ lon, lat, zoom, token: Date.now() })
            }
          />
        </div>
        <CarteMap
          layers={layers}
          onTierChange={setTier}
          flyTarget={flyTarget}
          venteDateRange={venteDateRange}
          onSelectVente={setSelectedParcelle}
        />
        <CarteLegend />
        {layers.ventes && ventesLocked && (
          <p className="carte-zoom-hint">Zoomez sur une parcelle pour afficher les ventes</p>
        )}
        {selectedParcelle && (
          <ParcelleDetailPanel selection={selectedParcelle} onClose={() => setSelectedParcelle(null)} />
        )}
      </div>
    </div>
  );
}
