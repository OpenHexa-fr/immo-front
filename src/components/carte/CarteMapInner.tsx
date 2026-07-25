"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

import { getPrixCarte, searchDVF, type PrixCarteBucket } from "@/lib/api";
import { haversineKm } from "@/lib/geo";
import { formatPrix, formatPrixM2, prixToColor } from "@/lib/prixColor";

export type CarteTier = "departement" | "commune" | "section";

export interface LayerVisibility {
  parcelles: boolean;
  ventes: boolean;
  prixM2: boolean;
}

export interface FlyTarget {
  lon: number;
  lat: number;
  zoom: number;
  token: number;
}

export interface DateRange {
  min: string;
  max: string;
}

export interface ParcelleSelection {
  idParcelle: string;
  contenance?: number | null;
}

interface CarteMapInnerProps {
  layers: LayerVisibility;
  onTierChange?: (tier: CarteTier) => void;
  flyTarget?: FlyTarget | null;
  venteDateRange?: DateRange;
  onSelectVente?: (selection: ParcelleSelection) => void;
}

const PCI_SOURCE_URL = "https://data.geopf.fr/tms/1.0.0/PCI/{z}/{x}/{y}.pbf";
const FRANCE_CENTER: [number, number] = [2.4, 46.6];
const VENTES_MIN_ZOOM = 14;

const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
    pci: {
      type: "vector",
      tiles: [PCI_SOURCE_URL],
      scheme: "xyz",
      minzoom: 5,
      maxzoom: 19,
      attribution: '&copy; <a href="https://cartes.gouv.fr">IGN</a> - PCI vecteur',
    },
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#eef1f2" } },
    { id: "osm", type: "raster", source: "osm", paint: { "raster-opacity": 0.55 } },
    {
      id: "batiment",
      type: "fill",
      source: "pci",
      "source-layer": "batiment",
      minzoom: 16,
      paint: { "fill-color": "#c9ccd1", "fill-opacity": 0.6 },
    },
    {
      id: "fill-departement",
      type: "fill",
      source: "pci",
      "source-layer": "departement",
      maxzoom: 9,
      paint: { "fill-color": "rgba(0,0,0,0)", "fill-opacity": 0.75 },
    },
    {
      id: "line-departement",
      type: "line",
      source: "pci",
      "source-layer": "departement",
      maxzoom: 9,
      paint: { "line-color": "#33475b", "line-width": 1 },
    },
    {
      id: "fill-commune",
      type: "fill",
      source: "pci",
      "source-layer": "commune",
      minzoom: 9,
      maxzoom: 15,
      paint: { "fill-color": "rgba(0,0,0,0)", "fill-opacity": 0.75 },
    },
    {
      id: "line-commune",
      type: "line",
      source: "pci",
      "source-layer": "commune",
      minzoom: 9,
      maxzoom: 15,
      paint: { "line-color": "#33475b", "line-width": 1 },
    },
    {
      id: "label-commune",
      type: "symbol",
      source: "pci",
      "source-layer": "commune",
      minzoom: 10,
      maxzoom: 15,
      layout: {
        "text-field": ["get", "nom_com"],
        "text-size": 12,
        "text-font": ["Noto Sans Regular"],
      },
      paint: {
        "text-color": "#202124",
        "text-halo-color": "#ffffff",
        "text-halo-width": 1.4,
      },
    },
    {
      id: "fill-section",
      type: "fill",
      source: "pci",
      "source-layer": "parcelle",
      minzoom: 15,
      paint: { "fill-color": "rgba(0,0,0,0)", "fill-opacity": 0.75 },
    },
    {
      id: "line-section",
      type: "line",
      source: "pci",
      "source-layer": "parcelle",
      minzoom: 15,
      paint: { "line-color": "#5f6368", "line-width": 0.8 },
    },
    {
      id: "fill-ventes",
      type: "fill",
      source: "pci",
      "source-layer": "parcelle",
      minzoom: VENTES_MIN_ZOOM,
      filter: ["in", ["get", "idu"], ["literal", []]],
      paint: { "fill-color": "#8e44ad", "fill-opacity": 0.45 },
    },
    {
      id: "line-ventes",
      type: "line",
      source: "pci",
      "source-layer": "parcelle",
      minzoom: VENTES_MIN_ZOOM,
      filter: ["in", ["get", "idu"], ["literal", []]],
      paint: { "line-color": "#6c3483", "line-width": 2 },
    },
  ],
};

function tierForZoom(zoom: number): CarteTier {
  if (zoom < 9) return "departement";
  if (zoom < 15) return "commune";
  return "section";
}

function buildMatchExpression(
  buckets: PrixCarteBucket[],
  codeProperty: string,
  sliceToSection: boolean,
): maplibregl.ExpressionSpecification {
  const expression: unknown[] = [
    "match",
    sliceToSection ? ["slice", ["get", codeProperty], 0, 10] : ["get", codeProperty],
  ];
  for (const bucket of buckets) {
    expression.push(bucket.code, prixToColor(bucket.prix_m2_median));
  }
  expression.push("rgba(0,0,0,0)");
  return expression as unknown as maplibregl.ExpressionSpecification;
}

const EMPTY_DATE_RANGE: DateRange = { min: "", max: "" };

export default function CarteMapInner({
  layers,
  onTierChange,
  flyTarget,
  venteDateRange = EMPTY_DATE_RANGE,
  onSelectVente,
}: CarteMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const layersRef = useRef(layers);
  const venteDateRangeRef = useRef(venteDateRange);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const cacheRef = useRef<Map<string, PrixCarteBucket[]>>(new Map());
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const loadVentesRef = useRef<((center: maplibregl.LngLat) => Promise<void>) | null>(null);
  const onSelectVenteRef = useRef(onSelectVente);

  layersRef.current = layers;
  venteDateRangeRef.current = venteDateRange;
  onSelectVenteRef.current = onSelectVente;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: FRANCE_CENTER,
      zoom: 5.3,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    const clearVentesMarkers = () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };

    async function loadPrixCarte(tier: CarteTier, center: maplibregl.LngLat) {
      let cacheKey = "departement";
      let codeProperty = "insee_dep";
      let sliceToSection = false;
      let scope: { code_departement?: string; code_commune?: string } | undefined;

      if (tier === "commune") {
        // Le département de la zone visible se lit directement sur la commune
        // sous le centre de la carte (`code_dep`), déjà chargée pour son
        // propre tracé — pas besoin d'une couche département séparée, dont
        // les données ne sont pas garanties présentes à ce niveau de zoom.
        const communeFeatures = map.queryRenderedFeatures(map.project(center), {
          layers: ["fill-commune"],
        });
        const codeDep = communeFeatures[0]?.properties?.code_dep as string | undefined;
        if (!codeDep) return;
        cacheKey = `commune:${codeDep}`;
        codeProperty = "code_insee";
        scope = { code_departement: codeDep };
      } else if (tier === "section") {
        // Même logique avec la commune de la parcelle sous le centre.
        const parcelleFeatures = map.queryRenderedFeatures(map.project(center), {
          layers: ["fill-section"],
        });
        const codeCommune = parcelleFeatures[0]?.properties?.code_insee as string | undefined;
        if (!codeCommune) return;
        cacheKey = `section:${codeCommune}`;
        codeProperty = "idu";
        sliceToSection = true;
        scope = { code_commune: codeCommune };
      }

      let buckets = cacheRef.current.get(cacheKey);
      if (!buckets) {
        const niveau = tier;
        const response = await getPrixCarte(niveau, scope);
        buckets = response.buckets;
        cacheRef.current.set(cacheKey, buckets);
      }

      const layerId =
        tier === "departement" ? "fill-departement" : tier === "commune" ? "fill-commune" : "fill-section";
      if (map.getLayer(layerId)) {
        map.setPaintProperty(
          layerId,
          "fill-color",
          buildMatchExpression(buckets, codeProperty, sliceToSection),
        );
      }
    }

    async function loadVentes(center: maplibregl.LngLat) {
      clearVentesMarkers();
      if (!layersRef.current.ventes || map.getZoom() < VENTES_MIN_ZOOM) {
        if (map.getLayer("fill-ventes")) {
          map.setFilter("fill-ventes", ["in", ["get", "idu"], ["literal", []]]);
          map.setFilter("line-ventes", ["in", ["get", "idu"], ["literal", []]]);
        }
        return;
      }

      const bounds = map.getBounds();
      const radiusKm = haversineKm(
        { lat: center.lat, lon: center.lng },
        { lat: bounds.getNorth(), lon: bounds.getEast() },
      );

      const { min, max } = venteDateRangeRef.current;
      const results = await searchDVF({
        lat: center.lat,
        lon: center.lng,
        radius_km: Math.max(radiusKm, 0.05),
        date_mutation_min: min || undefined,
        date_mutation_max: max || undefined,
        tri: "recent",
        // Toutes les ventes de la zone visible (bornée par le zoom minimum du
        // calque, donc une emprise réduite), pas un simple top-N. 1000 est le
        // maximum accepté par l'API (fenêtre de résultats Elasticsearch).
        size: 1000,
      });

      const parcelIds = results.items
        .map((item) => item.id_parcelle)
        .filter((id): id is string => Boolean(id));

      if (map.getLayer("fill-ventes")) {
        const filter: maplibregl.FilterSpecification = ["in", ["get", "idu"], ["literal", parcelIds]];
        map.setFilter("fill-ventes", filter);
        map.setFilter("line-ventes", filter);
      }

      for (const item of results.items) {
        if (!item.location || !item.id_parcelle) continue;
        const idParcelle = item.id_parcelle;
        const el = document.createElement("div");
        el.innerHTML = `<span class="marker-pin">${formatPrix(item.valeur_fonciere)}</span>`;
        const marker = new maplibregl.Marker({ element: el.firstElementChild as HTMLElement, anchor: "bottom" })
          .setLngLat([item.location.lon, item.location.lat])
          .addTo(map);
        el.firstElementChild?.addEventListener("click", () => {
          onSelectVenteRef.current?.({ idParcelle });
        });
        markersRef.current.push(marker);
      }
    }

    loadVentesRef.current = loadVentes;

    async function refreshColor() {
      const tier = tierForZoom(map.getZoom());
      onTierChange?.(tier);
      if (layersRef.current.prixM2) {
        await loadPrixCarte(tier, map.getCenter());
      }
    }

    async function refresh() {
      await refreshColor();
      await loadVentes(map.getCenter());
    }

    map.on("load", () => {
      refresh();
    });
    map.on("moveend", () => {
      refresh();
    });

    // Le changement de palier (département/commune/section) doit recolorer
    // le calque dès qu'on franchit son seuil de zoom, sans attendre la fin du
    // geste (`moveend`) : sinon la nouvelle couche apparaît transparente
    // pendant toute la durée du zoom/pan en cours. `idle` (tuiles réellement
    // chargées, pas seulement le geste terminé) sert de filet de sécurité si
    // la requête de zone a été tentée avant que les tuiles ne soient prêtes.
    let zoomDebounce: ReturnType<typeof setTimeout> | null = null;
    map.on("zoom", () => {
      if (zoomDebounce) clearTimeout(zoomDebounce);
      zoomDebounce = setTimeout(refreshColor, 120);
    });
    map.on("idle", () => {
      refreshColor();
    });

    map.on("click", (event) => {
      if (layersRef.current.ventes && map.getLayer("fill-ventes")) {
        const venteFeatures = map.queryRenderedFeatures(event.point, { layers: ["fill-ventes"] });
        const idParcelle = venteFeatures[0]?.properties?.idu as string | undefined;
        if (idParcelle) {
          const contenance = venteFeatures[0]?.properties?.contenance as number | undefined;
          onSelectVenteRef.current?.({ idParcelle, contenance });
          return;
        }
      }

      const zoom = map.getZoom();
      const tier = tierForZoom(zoom);
      const layerId =
        tier === "departement" ? "fill-departement" : tier === "commune" ? "fill-commune" : "fill-section";
      if (!map.getLayer(layerId)) return;

      const features = map.queryRenderedFeatures(event.point, { layers: [layerId] });
      if (!features.length) return;

      const properties = features[0].properties ?? {};
      const codeProperty =
        tier === "departement" ? "insee_dep" : tier === "commune" ? "code_insee" : "idu";
      const rawCode = properties[codeProperty] as string | undefined;
      if (!rawCode) return;
      const code = tier === "section" ? rawCode.slice(0, 10) : rawCode;

      // Le département (pour le niveau commune) et la commune (pour le
      // niveau section) sont déjà présents sur la feature cliquée elle-même.
      let cacheKey = "departement";
      if (tier === "commune") {
        cacheKey = `commune:${properties.code_dep as string | undefined}`;
      } else if (tier === "section") {
        cacheKey = `section:${properties.code_insee as string | undefined}`;
      }

      const bucket = cacheRef.current.get(cacheKey)?.find((item) => item.code === code);
      popupRef.current?.remove();
      popupRef.current = new maplibregl.Popup({ closeButton: false })
        .setLngLat(event.lngLat)
        .setHTML(
          bucket
            ? `<strong>${bucket.label}</strong> : ${formatPrixM2(bucket.prix_m2_median)}/m²`
            : `<strong>${code}</strong> : données indisponibles`,
        )
        .addTo(map);
    });

    return () => {
      clearVentesMarkers();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const visibility = (visible: boolean) => (visible ? "visible" : "none");
    for (const id of ["line-section"]) {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", visibility(layers.parcelles));
    }
    for (const id of ["fill-ventes", "line-ventes"]) {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", visibility(layers.ventes));
    }
    markersRef.current.forEach((marker) => {
      marker.getElement().style.display = layers.ventes ? "" : "none";
    });
    for (const id of ["fill-departement", "fill-commune", "fill-section"]) {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", visibility(layers.prixM2));
    }
  }, [layers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    loadVentesRef.current?.(map.getCenter());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venteDateRange.min, venteDateRange.max, layers.ventes]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyTarget) return;
    map.flyTo({ center: [flyTarget.lon, flyTarget.lat], zoom: flyTarget.zoom, duration: 1.2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyTarget?.token]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}
