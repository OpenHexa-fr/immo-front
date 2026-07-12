import Link from "next/link";
import { Suspense } from "react";

import { SearchBar } from "@/components/SearchBar";

export default function HomePage() {
  return (
    <section>
      <h1>Recherchez un bien immobilier</h1>
      <p>
        Transactions DVF, diagnostics DPE et permis de construire, à partir des données ouvertes
        du gouvernement français.
      </p>
      <Suspense fallback={null}>
        <SearchBar />
      </Suspense>
      <p>
        <Link href="/recherche">Voir tous les résultats</Link>
      </p>
    </section>
  );
}
