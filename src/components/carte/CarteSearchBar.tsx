"use client";

import { type FormEvent, useState } from "react";

interface CarteSearchBarProps {
  onLocate: (lon: number, lat: number, zoom: number) => void;
}

interface BanFeature {
  geometry: { coordinates: [number, number] };
  properties: { label: string; type: string };
}

// Base Adresse Nationale (data.gouv.fr) : géocodage public, sans clé.
const BAN_SEARCH_URL = "https://api-adresse.data.gouv.fr/search/";

export function CarteSearchBar({ onLocate }: CarteSearchBarProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const url = `${BAN_SEARCH_URL}?q=${encodeURIComponent(query)}&limit=1`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("geocode failed");
      const data = (await response.json()) as { features: BanFeature[] };
      const feature = data.features[0];
      if (!feature) {
        setError("Aucun résultat trouvé.");
        return;
      }
      const [lon, lat] = feature.geometry.coordinates;
      const zoom = feature.properties.type === "housenumber" ? 17 : feature.properties.type === "municipality" ? 12 : 14;
      onLocate(lon, lat, zoom);
    } catch {
      setError("La recherche a échoué.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="carte-search">
      <span className="search-bar__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"
            fill="currentColor"
          />
        </svg>
      </span>
      <input
        type="text"
        placeholder="Rechercher une adresse, une commune, une parcelle"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {loading && <span className="carte-search__spinner" aria-hidden="true" />}
      {error && (
        <p className="search-bar__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
