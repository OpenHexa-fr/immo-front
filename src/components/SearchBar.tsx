"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

interface SearchBarProps {
  variant?: "hero" | "panel";
}

export function SearchBar({ variant = "hero" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [commune, setCommune] = useState(searchParams.get("commune") ?? "");
  const [codePostal, setCodePostal] = useState(searchParams.get("code_postal") ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (commune) params.set("commune", commune);
    if (codePostal) params.set("code_postal", codePostal);
    router.push(`/recherche?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className={`search-bar search-bar--${variant}`}>
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
    </form>
  );
}
