"use client";

import { useRouter, useSearchParams } from "next/navigation";

const TYPES_LOCAL = [
  { value: "Maison", label: "Maison" },
  { value: "Appartement", label: "Appartement" },
  { value: "Dépendance", label: "Dépendance" },
  { value: "Local industriel. commercial ou assimilé", label: "Local commercial" },
];

const DPE_LABELS = ["A", "B", "C", "D", "E", "F", "G"];

const SORT_OPTIONS = [
  { value: "pertinence", label: "Pertinence" },
  { value: "prix", label: "Prix" },
  { value: "surface", label: "Surface" },
  { value: "distance", label: "Distance" },
  { value: "recent", label: "Récent" },
];

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasPosition = searchParams.has("lat") && searchParams.has("lon");

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/recherche?${params.toString()}`);
  }

  function toggleDpe(letter: string) {
    const active = searchParams.getAll("etiquette_dpe");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("etiquette_dpe");
    const next = active.includes(letter)
      ? active.filter((value) => value !== letter)
      : [...active, letter];
    for (const value of next) params.append("etiquette_dpe", value);
    router.push(`/recherche?${params.toString()}`);
  }

  const activeDpe = searchParams.getAll("etiquette_dpe");

  return (
    <div className="filter-bar">
      <div className="filter-bar__field">
        <select
          value={searchParams.get("type_local") ?? ""}
          onChange={(event) => updateParam("type_local", event.target.value)}
          aria-label="Type de bien"
        >
          <option value="">Tous types</option>
          {TYPES_LOCAL.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-bar__field">
        <input
          type="number"
          min={0}
          placeholder="Surface min (m²)"
          defaultValue={searchParams.get("surface_min") ?? ""}
          onBlur={(event) => updateParam("surface_min", event.target.value)}
          aria-label="Surface minimum"
        />
      </div>
      <div className="filter-bar__field">
        <input
          type="number"
          min={0}
          placeholder="Budget max (€)"
          defaultValue={searchParams.get("valeur_fonciere_max") ?? ""}
          onBlur={(event) => updateParam("valeur_fonciere_max", event.target.value)}
          aria-label="Budget maximum"
        />
      </div>
      <div className="filter-bar__field">
        <select
          value={searchParams.get("radius_km") ?? "10"}
          onChange={(event) => updateParam("radius_km", event.target.value)}
          disabled={!hasPosition}
          aria-label="Rayon de recherche"
          title={hasPosition ? "Rayon de recherche" : "Activez « Autour de moi » pour filtrer par rayon"}
        >
          {[5, 10, 20, 50].map((radius) => (
            <option key={radius} value={radius}>
              {radius} km
            </option>
          ))}
        </select>
      </div>
      {DPE_LABELS.map((letter) => (
        <button
          key={letter}
          type="button"
          className={`filter-bar__chip${activeDpe.includes(letter) ? " filter-bar__chip--active" : ""}`}
          onClick={() => toggleDpe(letter)}
        >
          {letter}
        </button>
      ))}
      <label className="filter-bar__sort">
        Trier par
        <select
          value={searchParams.get("tri") ?? "pertinence"}
          onChange={(event) => updateParam("tri", event.target.value)}
        >
          {SORT_OPTIONS.map((sort) => (
            <option key={sort.value} value={sort.value}>
              {sort.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
