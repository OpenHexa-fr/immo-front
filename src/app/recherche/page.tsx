import { Suspense } from "react";

import { SearchResults } from "@/components/SearchResults";
import { searchDVF, type DVFSortOption } from "@/lib/api";

interface RecherchePageProps {
  searchParams: {
    commune?: string;
    code_postal?: string;
    type_local?: string;
    valeur_fonciere_min?: string;
    valeur_fonciere_max?: string;
    surface_min?: string;
    surface_max?: string;
    etiquette_dpe?: string | string[];
    lat?: string;
    lon?: string;
    radius_km?: string;
    tri?: string;
  };
}

function ResultsSkeleton() {
  return (
    <div className="map-layout">
      <div className="map-layout__panel">
        <div className="map-layout__panel-header">
          <div className="skeleton" style={{ height: 40, borderRadius: 999 }} />
        </div>
        <div className="map-layout__list">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="skeleton-card" key={index}>
              <div className="skeleton" />
              <div className="skeleton" />
              <div className="skeleton" />
            </div>
          ))}
        </div>
      </div>
      <div className="map-layout__map skeleton" />
    </div>
  );
}

async function ResultsLoader({ searchParams }: RecherchePageProps) {
  const lat = searchParams.lat ? Number(searchParams.lat) : undefined;
  const lon = searchParams.lon ? Number(searchParams.lon) : undefined;
  const etiquetteDpe = searchParams.etiquette_dpe
    ? Array.isArray(searchParams.etiquette_dpe)
      ? searchParams.etiquette_dpe
      : [searchParams.etiquette_dpe]
    : undefined;

  const results = await searchDVF({
    commune: searchParams.commune,
    code_postal: searchParams.code_postal,
    type_local: searchParams.type_local ? [searchParams.type_local] : undefined,
    valeur_fonciere_min: searchParams.valeur_fonciere_min
      ? Number(searchParams.valeur_fonciere_min)
      : undefined,
    valeur_fonciere_max: searchParams.valeur_fonciere_max
      ? Number(searchParams.valeur_fonciere_max)
      : undefined,
    surface_min: searchParams.surface_min ? Number(searchParams.surface_min) : undefined,
    surface_max: searchParams.surface_max ? Number(searchParams.surface_max) : undefined,
    etiquette_dpe: etiquetteDpe,
    lat,
    lon,
    radius_km: searchParams.radius_km ? Number(searchParams.radius_km) : undefined,
    tri: (searchParams.tri as DVFSortOption | undefined) ?? undefined,
    size: 20,
  });

  const here = lat !== undefined && lon !== undefined ? { lat, lon } : null;

  return <SearchResults items={results.items} total={results.total} here={here} />;
}

export default function RecherchePage({ searchParams }: RecherchePageProps) {
  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <ResultsLoader searchParams={searchParams} />
    </Suspense>
  );
}
