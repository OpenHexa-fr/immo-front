"use client";

import { Suspense, useState } from "react";

import { FilterBar } from "@/components/FilterBar";
import { Map as LeafletMap } from "@/components/Map";
import { ResultCard } from "@/components/ResultCard";
import { SearchBar } from "@/components/SearchBar";
import { haversineKm } from "@/lib/geo";
import type { DVFTransaction } from "@/lib/api";

interface SearchResultsProps {
  items: DVFTransaction[];
  total: number;
  here?: { lat: number; lon: number } | null;
}

function markerId(item: DVFTransaction, index: number): string {
  return `${item.id_mutation}-${index}`;
}

function pricePerM2(item: DVFTransaction): number | null {
  if (!item.surface_reelle_bati || item.surface_reelle_bati <= 0) return null;
  return item.valeur_fonciere / item.surface_reelle_bati;
}

export function SearchResults({ items, total, here }: SearchResultsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [panelExpanded, setPanelExpanded] = useState(false);

  const priced = items.map((item, index) => ({
    id: markerId(item, index),
    item,
    price: pricePerM2(item),
  }));

  const rankById = new Map<string, 1 | 2 | 3>();
  [...priced]
    .filter((entry) => entry.price !== null)
    .sort((a, b) => (a.price as number) - (b.price as number))
    .slice(0, 3)
    .forEach((entry, index) => {
      rankById.set(entry.id, (index + 1) as 1 | 2 | 3);
    });

  const markers = priced
    .filter(({ item }) => item.location !== null)
    .map(({ id, item, price }) => ({
      id,
      lat: item.location!.lat,
      lon: item.location!.lon,
      label: `${item.commune} — ${item.valeur_fonciere.toLocaleString("fr-FR")} €`,
      price:
        price !== null
          ? `${Math.round(price).toLocaleString("fr-FR")} €/m²`
          : `${item.valeur_fonciere.toLocaleString("fr-FR")} €`,
      rank: rankById.get(id) ?? null,
    }));

  return (
    <div className="map-layout">
      <div className={`map-layout__panel${panelExpanded ? "" : " map-layout__panel--collapsed"}`}>
        <button
          type="button"
          className="map-layout__handle"
          onClick={() => setPanelExpanded((value) => !value)}
          aria-label={panelExpanded ? "Réduire la liste" : "Agrandir la liste"}
        >
          <span className="map-layout__handle-bar" />
        </button>
        <div className="map-layout__panel-header">
          <Suspense fallback={null}>
            <SearchBar variant="panel" />
          </Suspense>
          <p className="map-layout__count">{total} transaction(s) trouvée(s)</p>
        </div>
        <Suspense fallback={null}>
          <FilterBar />
        </Suspense>
        <div className="map-layout__list">
          {items.length === 0 && (
            <p className="map-layout__empty">
              {here
                ? "Aucune transaction dans ce rayon de recherche."
                : "Aucun résultat pour cette recherche."}
            </p>
          )}
          {items.map((item, index) => (
            <ResultCard
              key={markerId(item, index)}
              transaction={item}
              active={activeId === markerId(item, index)}
              onHover={() => setActiveId(markerId(item, index))}
              distanceKm={here && item.location ? haversineKm(here, item.location) : null}
            />
          ))}
        </div>
      </div>
      <div className="map-layout__map">
        <LeafletMap markers={markers} activeId={activeId} here={here} />
      </div>
    </div>
  );
}
