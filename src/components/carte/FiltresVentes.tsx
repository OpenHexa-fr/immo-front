"use client";

import type { Categorie } from "@/lib/api";

/** Filtres appliqués au calque des ventes. Une valeur absente = pas de borne. */
export interface FiltresVentes {
  typeLocal: string[];
  prixMin?: number;
  prixMax?: number;
  prixM2Max?: number;
  piecesMin?: number;
  etiquetteDpe: string[];
}

export const FILTRES_VIDES: FiltresVentes = { typeLocal: [], etiquetteDpe: [] };

const ETIQUETTES_DPE = ["A", "B", "C", "D", "E", "F", "G"];

// Valeurs telles qu'elles apparaissent dans DVF : le filtre est un `term` exact
// côté Elasticsearch, l'orthographe doit correspondre au fichier source.
const TYPES = ["Maison", "Appartement", "Dépendance", "Local industriel. commercial ou assimilé"];

const LIBELLES: Record<string, string> = {
  "Local industriel. commercial ou assimilé": "Local commercial",
};

interface FiltresVentesProps {
  filtres: FiltresVentes;
  onChange: (filtres: FiltresVentes) => void;
  categorie: Categorie;
  onCategorieChange: (categorie: Categorie) => void;
}

function nombreOuVide(valeur: string): number | undefined {
  const nombre = Number(valeur);
  return valeur === "" || Number.isNaN(nombre) ? undefined : nombre;
}

export function FiltresVentesPanel({
  filtres,
  onChange,
  categorie,
  onCategorieChange,
}: FiltresVentesProps) {
  const basculerType = (type: string) => {
    const actifs = filtres.typeLocal.includes(type)
      ? filtres.typeLocal.filter((valeur) => valeur !== type)
      : [...filtres.typeLocal, type];
    onChange({ ...filtres, typeLocal: actifs });
  };

  const basculerEtiquette = (etiquette: string) => {
    const actives = filtres.etiquetteDpe.includes(etiquette)
      ? filtres.etiquetteDpe.filter((valeur) => valeur !== etiquette)
      : [...filtres.etiquetteDpe, etiquette];
    onChange({ ...filtres, etiquetteDpe: actives });
  };

  const actifs =
    filtres.typeLocal.length +
    filtres.etiquetteDpe.length +
    (filtres.prixMin !== undefined ? 1 : 0) +
    (filtres.prixMax !== undefined ? 1 : 0) +
    (filtres.prixM2Max !== undefined ? 1 : 0) +
    (filtres.piecesMin !== undefined ? 1 : 0);

  return (
    <div className="filtres">
      <div className="filtres__entete">
        <span className="carte-sidebar__header">Filtres</span>
        {actifs > 0 && (
          <button type="button" className="filtres__reset" onClick={() => onChange(FILTRES_VIDES)}>
            Réinitialiser ({actifs})
          </button>
        )}
      </div>

      {/* La choroplèthe reste une vue d'ensemble non filtrée : elle est
          pré-agrégée, la recolorer à la volée annulerait ce mécanisme. Seul le
          marché affiché (bâti ou terrain) la concerne. */}
      <div className="filtres__groupe">
        <span className="filtres__label">Marché affiché sur la carte</span>
        <div className="filtres__segments">
          {(["bati", "terrain"] as const).map((valeur) => (
            <button
              key={valeur}
              type="button"
              className={`filtres__segment ${categorie === valeur ? "filtres__segment--actif" : ""}`}
              onClick={() => onCategorieChange(valeur)}
            >
              {valeur === "bati" ? "Bâti" : "Terrain nu"}
            </button>
          ))}
        </div>
      </div>

      <div className="filtres__groupe">
        <span className="filtres__label">Type de bien</span>
        {TYPES.map((type) => (
          <label className="filtres__case" key={type}>
            <input
              type="checkbox"
              checked={filtres.typeLocal.includes(type)}
              onChange={() => basculerType(type)}
            />
            {LIBELLES[type] ?? type}
          </label>
        ))}
      </div>

      <div className="filtres__groupe">
        <span className="filtres__label">Prix de vente (€)</span>
        <div className="filtres__paire">
          <input
            type="number"
            placeholder="min"
            value={filtres.prixMin ?? ""}
            onChange={(e) => onChange({ ...filtres, prixMin: nombreOuVide(e.target.value) })}
          />
          <input
            type="number"
            placeholder="max"
            value={filtres.prixMax ?? ""}
            onChange={(e) => onChange({ ...filtres, prixMax: nombreOuVide(e.target.value) })}
          />
        </div>
      </div>

      <div className="filtres__groupe">
        <span className="filtres__label">Prix au m² maximum</span>
        <input
          type="number"
          placeholder="ex. 3000"
          value={filtres.prixM2Max ?? ""}
          onChange={(e) => onChange({ ...filtres, prixM2Max: nombreOuVide(e.target.value) })}
        />
      </div>

      <div className="filtres__groupe">
        <span className="filtres__label">Pièces minimum</span>
        <input
          type="number"
          min={1}
          placeholder="ex. 3"
          value={filtres.piecesMin ?? ""}
          onChange={(e) => onChange({ ...filtres, piecesMin: nombreOuVide(e.target.value) })}
        />
      </div>

      <div className="filtres__groupe">
        <span className="filtres__label">Étiquette DPE</span>
        <div className="filtres__dpe">
          {ETIQUETTES_DPE.map((etiquette) => (
            <button
              key={etiquette}
              type="button"
              className={`filtres__dpe-case dpe-badge dpe-badge--${etiquette} ${
                filtres.etiquetteDpe.includes(etiquette) ? "filtres__dpe-case--actif" : ""
              }`}
              onClick={() => basculerEtiquette(etiquette)}
              aria-pressed={filtres.etiquetteDpe.includes(etiquette)}
            >
              {etiquette}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
