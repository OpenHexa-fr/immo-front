"use client";

import { type FormEvent, useState } from "react";

import { geocodeAddress } from "@/lib/geocode";

interface CarteSearchBarProps {
  onLocate: (lon: number, lat: number, zoom: number) => void;
}

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
      const result = await geocodeAddress(query);
      if (!result) {
        setError("Aucun résultat trouvé.");
        return;
      }
      onLocate(result.lon, result.lat, result.zoom);
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
