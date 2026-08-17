// Côté serveur (composants serveur, SSR), le backend est joignable via le nom
// de service Docker interne. Côté navigateur (composants client, `fetch` dans
// un `useEffect`), seule une URL exposée sur l'hôte est joignable : ces deux
// contextes ne peuvent donc pas partager la même variable "publique" (inlinée
// telle quelle au build, y compris côté serveur).
const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000");

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface DVFTransaction {
  id_mutation: string;
  date_mutation: string;
  valeur_fonciere: number;
  surface_reelle_bati: number | null;
  surface_terrain: number | null;
  nombre_pieces_principales: number | null;
  type_local: string | null;
  commune: string;
  code_postal: string;
  code_departement: string | null;
  code_commune: string | null;
  code_section: string | null;
  id_parcelle: string | null;
  adresse: string | null;
  prix_m2: number | null;
  location: GeoPoint | null;
  etiquette_dpe: string | null;
}

export type DVFSortOption = "pertinence" | "prix" | "surface" | "distance" | "recent";

/** Emprise rectangulaire dans l'ordre GeoJSON, celui de `map.getBounds().toArray()`. */
export type BBox = [minLon: number, minLat: number, maxLon: number, maxLat: number];

export interface DVFSearchParams {
  commune?: string;
  code_postal?: string;
  id_parcelle?: string;
  type_local?: string[];
  valeur_fonciere_min?: number;
  valeur_fonciere_max?: number;
  surface_min?: number;
  surface_max?: number;
  etiquette_dpe?: string[];
  date_mutation_min?: string;
  date_mutation_max?: string;
  lat?: number;
  lon?: number;
  radius_km?: number;
  /** Prime sur `lat`/`lon` + `radius_km` pour filtrer ; ceux-ci restent utiles au tri. */
  bbox?: BBox;
  /** `carte` ne demande au backend que les champs nécessaires à l'affichage cartographique. */
  champs?: "complet" | "carte";
  tri?: DVFSortOption;
  search_after?: string[];
  size?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  next_search_after: unknown[] | null;
}

function buildQueryString(params: Record<string, unknown>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    // `bbox` est une liste côté TypeScript mais un scalaire côté API (une
    // chaîne `min_lon,min_lat,max_lon,max_lat`), contrairement aux filtres
    // multivalués qui se répètent.
    if (key === "bbox" && Array.isArray(value)) {
      query.append(key, value.join(","));
    } else if (Array.isArray(value)) {
      for (const item of value) query.append(key, String(item));
    } else {
      query.append(key, String(value));
    }
  }
  return query.toString();
}

// Les données DVF ne changent qu'au rythme de l'ingestion (hebdomadaire). Le
// backend envoie désormais un `Cache-Control` explicite, que le navigateur
// applique seul ; côté serveur, Next a besoin d'une durée de revalidation pour
// ne pas figer la réponse au build.
const DEFAULT_REVALIDATE_SECONDS = 3600;

interface ApiOptions {
  signal?: AbortSignal;
  /** À réserver aux données temps réel (`/status`), qui ne doivent jamais être servies d'un cache. */
  noStore?: boolean;
}

async function apiGet<T>(
  path: string,
  params: Record<string, unknown> = {},
  options: ApiOptions = {},
): Promise<T> {
  const query = buildQueryString(params);
  const url = query ? `${API_URL}${path}?${query}` : `${API_URL}${path}`;
  const response = await fetch(url, {
    signal: options.signal,
    ...(options.noStore
      ? { cache: "no-store" as const }
      : { next: { revalidate: DEFAULT_REVALIDATE_SECONDS } }),
  });
  if (!response.ok) {
    throw new Error(`Requête API échouée (${response.status}) : ${url}`);
  }
  return (await response.json()) as T;
}

export function searchDVF(
  params: DVFSearchParams,
  options: ApiOptions = {},
): Promise<PaginatedResponse<DVFTransaction>> {
  return apiGet<PaginatedResponse<DVFTransaction>>("/api/v1/dvf/search", { ...params }, options);
}

export function getDVFByMutation(idMutation: string): Promise<DVFTransaction[]> {
  return apiGet<DVFTransaction[]>(`/api/v1/dvf/${encodeURIComponent(idMutation)}`);
}

export interface DomainStatus {
  dvf: boolean;
  dpe: boolean;
  sitage: boolean;
}

export function getStatus(): Promise<DomainStatus> {
  // Interrogé en boucle par le bandeau de synchronisation : une réponse mise en
  // cache le laisserait affiché après la fin de l'ingestion.
  return apiGet<DomainStatus>("/api/v1/status", {}, { noStore: true });
}

export type PrixCarteNiveau = "departement" | "commune" | "section";

export interface PrixCarteBucket {
  code: string;
  label: string;
  prix_m2_median: number;
  /** Absents quand la réponse vient du repli à la volée, avant pré-agrégation des zones. */
  prix_m2_p25?: number | null;
  prix_m2_p75?: number | null;
  nb_mutations: number;
}

export interface PrixCarteResponse {
  niveau: PrixCarteNiveau;
  buckets: PrixCarteBucket[];
  /** Date du dernier calcul des zones, `null` si la réponse vient du repli à la volée. */
  calcule_le?: string | null;
}

export function getPrixCarte(
  niveau: PrixCarteNiveau,
  scope?: { code_departement?: string; code_commune?: string },
  options: ApiOptions = {},
): Promise<PrixCarteResponse> {
  return apiGet<PrixCarteResponse>("/api/v1/dvf/prix-carte", { niveau, ...scope }, options);
}
