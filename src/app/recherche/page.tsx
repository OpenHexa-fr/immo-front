import { Suspense } from "react";

import { Map } from "@/components/Map";
import { ResultCard } from "@/components/ResultCard";
import { SearchBar } from "@/components/SearchBar";
import { searchDVF } from "@/lib/api";

interface RecherchePageProps {
  searchParams: { commune?: string; code_postal?: string };
}

export default async function RecherchePage({ searchParams }: RecherchePageProps) {
  const results = await searchDVF({
    commune: searchParams.commune,
    code_postal: searchParams.code_postal,
    size: 20,
  });

  const markers = results.items
    .filter((item) => item.location !== null)
    .map((item) => ({
      lat: item.location!.lat,
      lon: item.location!.lon,
      label: `${item.commune} — ${item.valeur_fonciere.toLocaleString("fr-FR")} €`,
    }));

  return (
    <section>
      <h1>Résultats de recherche</h1>
      <Suspense fallback={null}>
        <SearchBar />
      </Suspense>
      <p>{results.total} transaction(s) trouvée(s)</p>
      <Map markers={markers} />
      <div className="results-grid">
        {results.items.map((item, index) => (
          <ResultCard key={`${item.id_mutation}-${index}`} transaction={item} />
        ))}
      </div>
    </section>
  );
}
