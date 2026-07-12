"use client";

import { Suspense, useState } from "react";

import { Map } from "@/components/Map";
import { ResultCard } from "@/components/ResultCard";
import { SearchBar } from "@/components/SearchBar";
import type { DVFTransaction } from "@/lib/api";

interface SearchResultsProps {
  items: DVFTransaction[];
  total: number;
}

function markerId(item: DVFTransaction, index: number): string {
  return `${item.id_mutation}-${index}`;
}

export function SearchResults({ items, total }: SearchResultsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const markers = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.location !== null)
    .map(({ item, index }) => ({
      id: markerId(item, index),
      lat: item.location!.lat,
      lon: item.location!.lon,
      label: `${item.commune} — ${item.valeur_fonciere.toLocaleString("fr-FR")} €`,
    }));

  return (
    <div className="map-layout">
      <div className="map-layout__panel">
        <div className="map-layout__panel-header">
          <Suspense fallback={null}>
            <SearchBar variant="panel" />
          </Suspense>
          <p className="map-layout__count">{total} transaction(s) trouvée(s)</p>
        </div>
        <div className="map-layout__list">
          {items.length === 0 && (
            <p className="map-layout__empty">Aucun résultat pour cette recherche.</p>
          )}
          {items.map((item, index) => (
            <ResultCard
              key={markerId(item, index)}
              transaction={item}
              active={activeId === markerId(item, index)}
              onHover={() => setActiveId(markerId(item, index))}
            />
          ))}
        </div>
      </div>
      <div className="map-layout__map">
        <Map markers={markers} activeId={activeId} />
      </div>
    </div>
  );
}
