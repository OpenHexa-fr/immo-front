// Base Adresse Nationale (data.gouv.fr) : géocodage public, sans clé.
const BAN_SEARCH_URL = "https://api-adresse.data.gouv.fr/search/";

export interface GeocodeResult {
  lat: number;
  lon: number;
  zoom: number;
}

interface BanFeature {
  geometry: { coordinates: [number, number] };
  properties: { label: string; type: string };
}

export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const url = `${BAN_SEARCH_URL}?q=${encodeURIComponent(query)}&limit=1`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("geocode failed");
  const data = (await response.json()) as { features: BanFeature[] };
  const feature = data.features[0];
  if (!feature) return null;
  const [lon, lat] = feature.geometry.coordinates;
  const zoom =
    feature.properties.type === "housenumber" ? 17 : feature.properties.type === "municipality" ? 12 : 14;
  return { lat, lon, zoom };
}
