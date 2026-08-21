"use client";

import { useEffect, useState } from "react";

import { formatPrixM2 } from "@/lib/prixColor";
import { formatVariation, getPrixSerie, type Categorie, type PrixSerieResponse } from "@/lib/api";

interface EvolutionZoneProps {
  codeCommune: string;
  categorie?: Categorie;
}

/** Classe de couleur d'une variation : hausse, baisse, ou stable. */
function tonalite(pct: number): string {
  if (pct > 0.5) return "evolution--hausse";
  if (pct < -0.5) return "evolution--baisse";
  return "evolution--stable";
}

/**
 * Évolution annuelle du prix médian de la commune.
 *
 * La choroplèthe montre une médiane tous millésimes confondus, qui masque le
 * mouvement du marché : entre 2021 et 2025, la tendance s'est inversée.
 */
export function EvolutionZone({ codeCommune, categorie = "bati" }: EvolutionZoneProps) {
  const [serie, setSerie] = useState<PrixSerieResponse | null>(null);
  const [absente, setAbsente] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setSerie(null);
    setAbsente(false);
    getPrixSerie("commune", codeCommune, categorie, { signal: controller.signal })
      .then(setSerie)
      .catch((cause) => {
        if ((cause as { name?: string }).name !== "AbortError") setAbsente(true);
      });
    return () => controller.abort();
  }, [codeCommune, categorie]);

  if (absente || (serie !== null && serie.points.length < 2)) return null;
  if (serie === null) return null;

  const maximum = Math.max(...serie.points.map((point) => point.prix_m2_median));
  const totale = serie.evolution_totale_pct;

  return (
    <div className="evolution">
      <div className="evolution__entete">
        <span className="evolution__titre">
          Évolution du prix médian{serie.label ? ` — ${serie.label}` : ""}
        </span>
        {totale != null && (
          <span className={`evolution__totale ${tonalite(totale)}`}>
            {formatVariation(totale)}
            <span className="evolution__periode">
              {serie.points[0].annee} → {serie.points[serie.points.length - 1].annee}
            </span>
          </span>
        )}
      </div>

      <div className="evolution__barres">
        {serie.points.map((point) => (
          <div className="evolution__barre-col" key={point.annee}>
            <span className="evolution__valeur">{formatPrixM2(point.prix_m2_median)}</span>
            <div
              className="evolution__barre"
              // Hauteur proportionnelle au maximum de la série, plancher à 8 %
              // pour qu'une année creuse reste visible et survolable.
              style={{ height: `${Math.max(8, (point.prix_m2_median / maximum) * 100)}%` }}
              title={`${point.nb_mutations.toLocaleString("fr-FR")} ventes en ${point.annee}`}
            />
            <span className="evolution__annee">{point.annee}</span>
            {point.evolution_pct != null && (
              <span className={`evolution__delta ${tonalite(point.evolution_pct)}`}>
                {formatVariation(point.evolution_pct)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
