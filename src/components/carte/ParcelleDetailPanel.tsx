"use client";

import { useEffect, useState } from "react";

import { getParcelle, type ParcelleMutation } from "@/lib/api";
import { formatPrix, formatPrixM2 } from "@/lib/prixColor";

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

export function ParcelleDetailPanel({ selection, onClose }: ParcelleDetailPanelProps) {
  const [mutations, setMutations] = useState<ParcelleMutation[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setMutations(null);
    setError(false);
    // Le regroupement par mutation est fait par Elasticsearch : la limite porte
    // désormais sur un nombre de mutations, la mesure qu'affiche ce panneau.
    getParcelle(selection.idParcelle, { signal: controller.signal })
      .then((response) => setMutations(response.mutations))
      .catch((cause) => {
        if ((cause as { name?: string }).name !== "AbortError") setError(true);
      });
    return () => {
      controller.abort();
    };
  }, [selection.idParcelle]);

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
        {mutations?.map(({ id_mutation, lots }) => {
          const lot = lots[0];
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
      </div>
    </div>
  );
}
