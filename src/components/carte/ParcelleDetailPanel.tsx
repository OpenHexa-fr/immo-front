"use client";

import { useEffect, useState } from "react";

import {
  formatVariation,
  getParcelle,
  getZone,
  type ParcelleMutation,
  type ZoneResponse,
} from "@/lib/api";
import { formatPrix, formatPrixM2 } from "@/lib/prixColor";

import { EvolutionZone } from "./EvolutionZone";

import type { ParcelleSelection } from "./CarteMapInner";

interface ParcelleDetailPanelProps {
  selection: ParcelleSelection;
  onClose: () => void;
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-6.1 7-11.5a7 7 0 1 0-14 0C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

function HouseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function RoomsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="12" rx="1" />
      <path d="M3 7V5a1 1 0 0 1 1-1h4M21 7V5a1 1 0 0 0-1-1h-4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

// Taille de la première page. Une parcelle dépasse rarement quelques ventes ;
// au-delà, mieux vaut charger à la demande que faire attendre tout le monde
// pour un cas rare.
const PAGE_MUTATIONS = 50;

// Au-delà de cet écart de surface bâtie, deux ventes ne portent plus sur le
// même bien : un terrain nu revendu bâti afficherait une « hausse » qui ne
// mesure que la construction. Mieux vaut ne rien annoncer.
const ECART_SURFACE_TOLERE = 0.1;

/** Variation de prix entre deux ventes successives, si elles sont comparables. */
function variationEntreVentes(
  courante: ParcelleMutation,
  precedente: ParcelleMutation,
): number | null {
  const prixCourant = courante.lots[0]?.valeur_fonciere;
  const prixPrecedent = precedente.lots[0]?.valeur_fonciere;
  if (!prixCourant || !prixPrecedent) return null;

  const surfaceCourante = courante.lots[0]?.surface_reelle_bati ?? null;
  const surfacePrecedente = precedente.lots[0]?.surface_reelle_bati ?? null;
  if (surfaceCourante !== null && surfacePrecedente !== null && surfacePrecedente > 0) {
    const ecart = Math.abs(surfaceCourante - surfacePrecedente) / surfacePrecedente;
    if (ecart > ECART_SURFACE_TOLERE) return null;
  } else if (surfaceCourante !== surfacePrecedente) {
    // L'un est bâti, l'autre non : la comparaison n'a pas de sens.
    return null;
  }

  return ((prixCourant - prixPrecedent) / prixPrecedent) * 100;
}

function tonalite(pct: number): string {
  if (pct > 0.5) return "evolution--hausse";
  if (pct < -0.5) return "evolution--baisse";
  return "evolution--stable";
}

export function ParcelleDetailPanel({ selection, onClose }: ParcelleDetailPanelProps) {
  const [mutations, setMutations] = useState<ParcelleMutation[] | null>(null);
  const [error, setError] = useState(false);
  const [taille, setTaille] = useState(PAGE_MUTATIONS);
  const [zone, setZone] = useState<ZoneResponse | null>(null);
  const [chargementSuite, setChargementSuite] = useState(false);

  // Une page pleine ne prouve pas qu'il y en a d'autres, mais c'est le seul
  // indice disponible : l'endpoint ne renvoie pas de total.
  const peutEnAvoirPlus = mutations !== null && mutations.length >= taille;

  useEffect(() => {
    setTaille(PAGE_MUTATIONS);
  }, [selection.idParcelle]);

  useEffect(() => {
    const controller = new AbortController();
    if (taille === PAGE_MUTATIONS) setMutations(null);
    setError(false);
    setChargementSuite(taille > PAGE_MUTATIONS);
    // Le regroupement par mutation est fait par Elasticsearch : la limite porte
    // sur un nombre de mutations, la mesure qu'affiche ce panneau.
    getParcelle(selection.idParcelle, { size: taille }, { signal: controller.signal })
      .then((response) => {
        setMutations(response.mutations);
        setChargementSuite(false);
      })
      .catch((cause) => {
        if ((cause as { name?: string }).name !== "AbortError") {
          setError(true);
          setChargementSuite(false);
        }
      });
    return () => {
      controller.abort();
    };
  }, [selection.idParcelle, taille]);

  const codeCommune = mutations?.[0]?.lots[0]?.code_commune ?? null;

  // Médiane communale : sert de référence pour situer chaque vente dans son
  // marché local. Une zone inconnue (calcul pas encore passé) désactive
  // simplement l'affichage.
  useEffect(() => {
    if (!codeCommune) return;
    const controller = new AbortController();
    getZone("commune", codeCommune, { signal: controller.signal })
      .then(setZone)
      .catch(() => setZone(null));
    return () => controller.abort();
  }, [codeCommune]);

  const first = mutations?.[0]?.lots[0];
  const adresse = first?.adresse
    ? `${first.adresse} ${first.code_postal} ${first.commune}`
    : first
      ? `${first.commune} (${first.code_postal})`
      : null;

  return (
    <div className="parcelle-panel">
      <button type="button" className="parcelle-panel__close" onClick={onClose} aria-label="Fermer">
        <CloseIcon />
      </button>
      <h2 className="parcelle-panel__title">{adresse ?? `Parcelle ${selection.idParcelle}`}</h2>
      <div className="parcelle-panel__meta">
        <div>
          <span className="parcelle-panel__meta-label">N° de parcelle</span>
          <span className="parcelle-panel__meta-value">{selection.idParcelle}</span>
        </div>
        {selection.contenance != null && (
          <div>
            <span className="parcelle-panel__meta-label">Surface cadastrale</span>
            <span className="parcelle-panel__meta-value">{selection.contenance} m²</span>
          </div>
        )}
      </div>

      <div className="parcelle-panel__tabs">
        <span className="parcelle-panel__tab parcelle-panel__tab--active">
          Ventes {mutations ? `(${mutations.length})` : ""}
        </span>
      </div>

      <div className="parcelle-panel__list">
        {error && <p className="parcelle-panel__empty">Impossible de charger l&apos;historique de cette parcelle.</p>}
        {!error && mutations === null && <p className="parcelle-panel__empty">Chargement…</p>}
        {mutations !== null && mutations.length === 0 && (
          <p className="parcelle-panel__empty">Aucune vente connue sur cette parcelle (2021-2025).</p>
        )}
        {mutations?.map(({ id_mutation, lots }, rang) => {
          const lot = lots[0];
          // Les mutations sont triées de la plus récente à la plus ancienne :
          // la vente précédente d'une même parcelle est donc la suivante.
          const precedente = mutations[rang + 1];
          const variation = precedente ? variationEntreVentes({ id_mutation, lots, date_mutation: lot.date_mutation }, precedente) : null;
          const ecartMediane =
            zone && lot.prix_m2 != null && zone.prix_m2_median > 0
              ? ((lot.prix_m2 - zone.prix_m2_median) / zone.prix_m2_median) * 100
              : null;
          return (
            <div className="parcelle-panel__sale" key={id_mutation}>
              <div className="parcelle-panel__sale-row">
                <span className="parcelle-panel__sale-label">Vente</span>
                <span className="parcelle-panel__sale-price">
                  {formatPrix(lot.valeur_fonciere)}
                  {lot.prix_m2 != null && (
                    <span className="parcelle-panel__sale-price-m2">{formatPrixM2(lot.prix_m2)}/m²</span>
                  )}
                </span>
              </div>
              <p className="parcelle-panel__sale-date">
                <CalendarIcon /> {new Date(lot.date_mutation).toLocaleDateString("fr-FR")}
              </p>
              <div className="parcelle-panel__variations">
                {variation != null && precedente && (
                  <span className={`parcelle-panel__variation ${tonalite(variation)}`}>
                    {formatVariation(variation)} depuis {new Date(precedente.date_mutation).getFullYear()}
                  </span>
                )}
                {ecartMediane != null && (
                  <span
                    className={`parcelle-panel__variation ${tonalite(ecartMediane)}`}
                    title={`Prix médian de la commune : ${formatPrixM2(zone!.prix_m2_median)}/m²`}
                  >
                    {formatVariation(ecartMediane)} vs médiane communale
                  </span>
                )}
              </div>
              <div className="parcelle-panel__sale-row">
                {lot.adresse && (
                  <span className="parcelle-panel__sale-address">
                    <PinIcon /> {lot.adresse} {lot.code_postal} {lot.commune}
                  </span>
                )}
                {lot.surface_terrain != null && (
                  <span className="parcelle-panel__sale-address">Terrain : {lot.surface_terrain} m²</span>
                )}
              </div>
              <p className="parcelle-panel__sale-address">
                {lots.length} lot{lots.length > 1 ? "s" : ""}
              </p>
              {lots.map((item, index) => (
                <div className="parcelle-panel__lot" key={index}>
                  <span>
                    <HouseIcon /> {item.type_local ?? "Bien"}
                  </span>
                  {item.nombre_pieces_principales != null && (
                    <span>
                      <RoomsIcon /> {item.nombre_pieces_principales} pièce
                      {item.nombre_pieces_principales > 1 ? "s" : ""}
                    </span>
                  )}
                  {item.surface_reelle_bati != null && <span>{item.surface_reelle_bati} m²</span>}
                </div>
              ))}
            </div>
          );
        })}
        {codeCommune && <EvolutionZone codeCommune={codeCommune} />}
        {peutEnAvoirPlus && (
          <button
            type="button"
            className="parcelle-panel__plus"
            onClick={() => setTaille((valeur) => valeur + PAGE_MUTATIONS)}
            disabled={chargementSuite}
          >
            {chargementSuite ? "Chargement…" : "Afficher plus de ventes"}
          </button>
        )}
      </div>
    </div>
  );
}
