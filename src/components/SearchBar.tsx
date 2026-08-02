"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [commune, setCommune] = useState(searchParams.get("commune") ?? "");
  const [codePostal, setCodePostal] = useState(searchParams.get("code_postal") ?? "");
  const [geoError, setGeoError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (commune) {
      params.set("commune", commune);
    } else {
      params.delete("commune");
    }
    if (codePostal) {
      params.set("code_postal", codePostal);
    } else {
      params.delete("code_postal");
    }
    params.delete("lat");
    params.delete("lon");
    router.push(`/carte?${params.toString()}`);
  }

  function handleGeolocate() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", String(position.coords.latitude));
        params.set("lon", String(position.coords.longitude));
        params.delete("commune");
        params.delete("code_postal");
        router.push(`/carte?${params.toString()}`);
      },
      () => {
        setGeoError("Impossible de récupérer votre position.");
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="search-bar search-bar--hero">
      <span className="search-bar__icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"
            fill="currentColor"
          />
        </svg>
      </span>
      <input
        type="text"
        name="commune"
        placeholder="Commune"
        value={commune}
        onChange={(event) => setCommune(event.target.value)}
      />
      <input
        type="text"
        name="code_postal"
        placeholder="Code postal"
        value={codePostal}
        onChange={(event) => setCodePostal(event.target.value)}
      />
      <button type="submit" className="search-bar__submit">
        Rechercher
      </button>
      <button type="button" className="search-bar__secondary" onClick={handleGeolocate}>
        <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8.94 3A9 9 0 0 0 13 3.06V1h-2v2.06A9 9 0 0 0 3.06 11H1v2h2.06A9 9 0 0 0 11 20.94V23h2v-2.06A9 9 0 0 0 20.94 13H23v-2h-2.06zM12 19a7 7 0 1 1 0-14 7 7 0 0 1 0 14z"
            fill="currentColor"
          />
        </svg>
        Autour de moi
      </button>
      {geoError && (
        <p className="search-bar__error" role="alert">
          {geoError}
        </p>
      )}
    </form>
  );
}
