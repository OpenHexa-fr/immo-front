"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

export function SearchBar() {
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
    <form onSubmit={handleSubmit} className="search-bar">
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
      <button type="submit">Rechercher</button>
    </form>
  );
}
