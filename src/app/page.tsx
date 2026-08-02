import Link from "next/link";
import { Suspense } from "react";

import { NearbyPreview } from "@/components/NearbyPreview";
import { SearchBar } from "@/components/SearchBar";

export default function HomePage() {
  return (
    <section className="hero">
      <h1 className="hero__title">Recherchez un bien immobilier</h1>
      <p className="hero__subtitle">
        Transactions DVF, diagnostics DPE et permis de construire, à partir des données
        ouvertes du gouvernement français.
      </p>
      <Suspense fallback={null}>
        <SearchBar />
      </Suspense>
      <Link href="/carte" className="hero__link">
        Voir la carte des prix
      </Link>
      <NearbyPreview />
    </section>
  );
}
