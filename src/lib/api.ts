const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface DVFTransaction {
  id_mutation: string;
  date_mutation: string;
  valeur_fonciere: number;
  surface_reelle_bati: number | null;
  type_local: string | null;
  commune: string;
  code_postal: string;
  location: GeoPoint | null;
}

export interface DVFSearchParams {
  commune?: string;
  code_postal?: string;
  type_local?: string[];
  valeur_fonciere_min?: number;
  valeur_fonciere_max?: number;
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
