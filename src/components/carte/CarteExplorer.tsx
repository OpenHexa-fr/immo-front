"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { geocodeAddress } from "@/lib/geocode";
import type { Categorie } from "@/lib/api";

import { CarteLegend } from "./CarteLegend";
import { CarteMap } from "./CarteMap";
import type {
  CarteTier,
  DateRange,
  FlyTarget,
  LayerVisibility,
  ParcelleSelection,
  VentesEtat,
} from "./CarteMapInner";
import { CarteSearchBar } from "./CarteSearchBar";
import { FILTRES_VIDES, FiltresVentesPanel, type FiltresVentes, type VueCarte } from "./FiltresVentes";
import { LayerSidebar } from "./LayerSidebar";
import { ParcelleDetailPanel } from "./ParcelleDetailPanel";
import { ParcelleDpeHistoriquePanel } from "./ParcelleDpeHistoriquePanel";

const DEFAULT_LAYERS: LayerVisibility = { parcelles: true, ventes: false, prixM2: true };
const DEFAULT_DATE_RANGE: DateRange = { min: "", max: "" };
const DEFAULT_MAP_ZOOM = 12;

export function CarteExplorer() {
  const searchParams = useSearchParams();
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYERS);
  const [tier, setTier] = useState<CarteTier>("departement");
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);
  const [venteDateRange, setVenteDateRange] = useState<DateRange>(DEFAULT_DATE_RANGE);
  const [selectedParcelle, setSelectedParcelle] = useState<ParcelleSelection | null>(null);
  const [ventesEtat, setVentesEtat] = useState<VentesEtat | null>(null);
  const [filtres, setFiltres] = useState<FiltresVentes>(FILTRES_VIDES);
  const [categorie, setCategorie] = useState<Categorie>("bati");
  const [vue, setVue] = useState<VueCarte>("prix");
  const [parcelleDpe, setParcelleDpe] = useState<string | null>(null);

  const ventesLocked = tier !== "section";

  // Recherche lancée depuis l'accueil (commune, code postal ou "Autour de
  // moi") : on fait voler la carte des prix jusqu'à la zone trouvée, sans
  // jamais remplacer le choroplèthe par une carte à points.
  useEffect(() => {
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const commune = searchParams.get("commune");
    const codePostal = searchParams.get("code_postal");

    if (lat && lon) {
      setFlyTarget({ lon: Number(lon), lat: Number(lat), zoom: DEFAULT_MAP_ZOOM, token: Date.now() });
      return;
    }

    const label = commune ?? codePostal;
    if (!label) return;

    let cancelled = false;
    geocodeAddress(label)
      .then((result) => {
        if (!cancelled && result) {
          setFlyTarget({ lon: result.lon, lat: result.lat, zoom: result.zoom, token: Date.now() });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  function handleLocate(lon: number, lat: number, zoom: number) {
    setFlyTarget({ lon, lat, zoom, token: Date.now() });
  }

  return (
    <div className="carte-layout">
      <LayerSidebar
        layers={layers}
        onChange={setLayers}
        ventesLocked={ventesLocked}
        dateRange={venteDateRange}
        onDateRangeChange={setVenteDateRange}
      >
        <FiltresVentesPanel
          filtres={filtres}
          onChange={setFiltres}
          categorie={categorie}
          onCategorieChange={setCategorie}
          vue={vue}
          onVueChange={setVue}
        />
      </LayerSidebar>
      <div className="carte-layout__map">
        <div className="carte-layout__search">
          <CarteSearchBar onLocate={handleLocate} />
        </div>
        <CarteMap
          layers={layers}
          onTierChange={setTier}
          flyTarget={flyTarget}
          venteDateRange={venteDateRange}
          onSelectVente={setSelectedParcelle}
          onVentesChargees={setVentesEtat}
          filtres={filtres}
          categorie={categorie}
          vue={vue}
          onSelectParcelleDpe={setParcelleDpe}
        />
        <CarteLegend vue={vue} />
        {layers.ventes && ventesLocked && (
          <p className="carte-zoom-hint">Zoomez sur une parcelle pour afficher les ventes</p>
        )}
        {/* Une emprise dense dépasse le plafond d'une page de résultats : sans
            ce bandeau, les ventes manquantes disparaissaient silencieusement. */}
        {layers.ventes && !ventesLocked && ventesEtat?.tronque && (
          <p className="carte-zoom-hint carte-zoom-hint--alerte">
            {ventesEtat.affichees.toLocaleString("fr-FR")} ventes affichées sur{" "}
            {ventesEtat.total.toLocaleString("fr-FR")} dans cette zone — zoomez pour les voir toutes
          </p>
        )}
        {selectedParcelle && (
          <ParcelleDetailPanel selection={selectedParcelle} onClose={() => setSelectedParcelle(null)} />
        )}
        {parcelleDpe && (
          <ParcelleDpeHistoriquePanel idParcelle={parcelleDpe} onClose={() => setParcelleDpe(null)} />
        )}
      </div>
    </div>
  );
}
