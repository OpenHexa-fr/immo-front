"use client";

import { useEffect, useState } from "react";

import { getParcelleDpeHistorique, type DPEHistoriqueEntry } from "@/lib/api";
import { DPEBadge } from "@/components/DPEBadge";

interface ParcelleDpeHistoriquePanelProps {
  idParcelle: string;
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

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Date inconnue";
  return new Date(iso).toLocaleDateString("fr-FR");
}

/**
 * Historique complet des DPE d'une parcelle — tous les diagnostics connus à
 * ses adresses, sans filtre de date ni de score. Contrairement au badge DPE
 * d'une vente (un seul diagnostic retenu par la jointure), l'utilisateur voit
 * ici tout ce qui existe et juge lui-même de la pertinence de chaque entrée.
 */
export function ParcelleDpeHistoriquePanel({ idParcelle, onClose }: ParcelleDpeHistoriquePanelProps) {
  const [diagnostics, setDiagnostics] = useState<DPEHistoriqueEntry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setDiagnostics(null);
    setError(false);
    getParcelleDpeHistorique(idParcelle, { signal: controller.signal })
      .then((response) => setDiagnostics(response.diagnostics))
      .catch((cause) => {
        if ((cause as { name?: string }).name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, [idParcelle]);

  return (
    <div className="parcelle-panel">
      <button type="button" className="parcelle-panel__close" onClick={onClose} aria-label="Fermer">
        <CloseIcon />
      </button>
      <h2 className="parcelle-panel__title">Historique DPE</h2>
      <div className="parcelle-panel__meta">
        <div>
          <span className="parcelle-panel__meta-label">N° de parcelle</span>
          <span className="parcelle-panel__meta-value">{idParcelle}</span>
        </div>
      </div>

      <div className="parcelle-panel__tabs">
        <span className="parcelle-panel__tab parcelle-panel__tab--active">
          Diagnostics {diagnostics ? `(${diagnostics.length})` : ""}
        </span>
      </div>

      <div className="parcelle-panel__list">
        {error && <p className="parcelle-panel__empty">Impossible de charger l&apos;historique DPE.</p>}
        {!error && diagnostics === null && <p className="parcelle-panel__empty">Chargement…</p>}
        {diagnostics !== null && diagnostics.length === 0 && (
          <p className="parcelle-panel__empty">
            Aucun diagnostic connu à cette adresse. Cela ne signifie pas que le bien n&apos;en possède pas
            — l&apos;ADEME ne géocode pas tous les DPE qu&apos;elle reçoit.
          </p>
        )}
        {diagnostics?.map((diagnostic) => (
          <div className="parcelle-panel__sale" key={diagnostic.numero_dpe}>
            <div className="parcelle-panel__sale-row">
              <span className="parcelle-panel__sale-label">{diagnostic.type_batiment ?? "Bien"}</span>
              <DPEBadge etiquette={diagnostic.etiquette_dpe ?? null} typeLocal={diagnostic.type_batiment} />
            </div>
            <p className="parcelle-panel__sale-date">
              <CalendarIcon /> {formatDate(diagnostic.date_etablissement)}
            </p>
            <div className="parcelle-panel__sale-row">
              {diagnostic.surface_habitable != null && (
                <span className="parcelle-panel__sale-address">
                  Surface habitable : {Math.round(diagnostic.surface_habitable)} m²
                </span>
              )}
              {diagnostic.etiquette_ges && (
                <span className="parcelle-panel__sale-address">GES : {diagnostic.etiquette_ges}</span>
              )}
            </div>
            {diagnostic.score_ban != null && diagnostic.score_ban < 0.5 && (
              <p className="parcelle-panel__sale-address parcelle-panel__sale-address--reserve">
                Géocodage incertain — cette adresse n&apos;est peut-être pas exactement la bonne.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
