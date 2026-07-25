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
    if (Array.isArray(value)) {
      for (const item of value) query.append(key, String(item));
    } else {
      query.append(key, String(value));
    }
  }
  return query.toString();
}

async function apiGet<T>(path: string, params: Record<string, unknown> = {}): Promise<T> {
  const query = buildQueryString(params);
  const url = query ? `${API_URL}${path}?${query}` : `${API_URL}${path}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Requête API échouée (${response.status}) : ${url}`);
  }
  return (await response.json()) as T;
}

export function searchDVF(
  params: DVFSearchParams,
): Promise<PaginatedResponse<DVFTransaction>> {
  return apiGet<PaginatedResponse<DVFTransaction>>("/api/v1/dvf/search", { ...params });
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
  return apiGet<DomainStatus>("/api/v1/status");
}

export type PrixCarteNiveau = "departement" | "commune" | "section";

export interface PrixCarteBucket {
  code: string;
  label: string;
  prix_m2_median: number;
  nb_mutations: number;
}

export interface PrixCarteResponse {
  niveau: PrixCarteNiveau;
  buckets: PrixCarteBucket[];
}

export function getPrixCarte(
  niveau: PrixCarteNiveau,
  scope?: { code_departement?: string; code_commune?: string },
): Promise<PrixCarteResponse> {
  return apiGet<PrixCarteResponse>("/api/v1/dvf/prix-carte", { niveau, ...scope });
}
