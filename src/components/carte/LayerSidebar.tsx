"use client";

import type { DateRange, LayerVisibility } from "./CarteMapInner";

interface LayerSidebarProps {
  layers: LayerVisibility;
  onChange: (layers: LayerVisibility) => void;
  ventesLocked: boolean;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 3 18 18" />
      <path d="M10.6 5.1A11 11 0 0 1 12 5c7 0 11 7 11 7a17.6 17.6 0 0 1-3.5 4.4M6.6 6.6C3.8 8.4 2 12 2 12s4 7 11 7a10.5 10.5 0 0 0 4-.8" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

export function LayerSidebar({
  layers,
  onChange,
  ventesLocked,
  dateRange,
  onDateRangeChange,
}: LayerSidebarProps) {
  const toggle = (key: keyof LayerVisibility) => onChange({ ...layers, [key]: !layers[key] });

  return (
    <aside className="carte-sidebar">
      <div className="carte-sidebar__header">Configurer la vue</div>
      <ul className="carte-sidebar__list">
        <li className="carte-layer-item">
          <span className="carte-layer-item__dot" style={{ background: "#5f6368" }} />
          <span className="carte-layer-item__label">Parcelles</span>
          <button
            type="button"
            className="carte-layer-item__toggle"
            onClick={() => toggle("parcelles")}
            aria-label={layers.parcelles ? "Masquer les parcelles" : "Afficher les parcelles"}
          >
            {layers.parcelles ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        </li>
        <li className="carte-layer-item">
          <span className="carte-layer-item__dot" style={{ background: "#8e44ad" }} />
          <span className="carte-layer-item__label">
            Ventes
            {ventesLocked && <span className="carte-layer-item__hint">Zoomer pour afficher</span>}
          </span>
          <button
            type="button"
            className="carte-layer-item__toggle"
            onClick={() => toggle("ventes")}
            aria-label={layers.ventes ? "Masquer les ventes" : "Afficher les ventes"}
          >
            {layers.ventes ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        </li>
        {layers.ventes && !ventesLocked && (
          <li className="carte-layer-item__date-range">
            <label>
              Depuis
              <input
                type="date"
                value={dateRange.min}
                onChange={(event) => onDateRangeChange({ ...dateRange, min: event.target.value })}
              />
            </label>
            <label>
              Jusqu&apos;au
              <input
                type="date"
                value={dateRange.max}
                onChange={(event) => onDateRangeChange({ ...dateRange, max: event.target.value })}
              />
            </label>
            {(dateRange.min || dateRange.max) && (
              <button
                type="button"
                className="carte-layer-item__date-range-clear"
                onClick={() => onDateRangeChange({ min: "", max: "" })}
              >
                Toute la période
              </button>
            )}
          </li>
        )}
        <li className="carte-layer-item carte-layer-item--highlight">
          <span className="carte-layer-item__dot" style={{ background: "#f4d03f" }} />
          <span className="carte-layer-item__label">Prix médian au m²</span>
          <button
            type="button"
            className="carte-layer-item__toggle"
            onClick={() => toggle("prixM2")}
            aria-label={layers.prixM2 ? "Masquer le prix médian" : "Afficher le prix médian"}
          >
            {layers.prixM2 ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        </li>
      </ul>
      <button
        type="button"
        className="carte-sidebar__reset"
        onClick={() => onChange({ parcelles: true, ventes: false, prixM2: true })}
      >
        Réinitialiser les calques
      </button>
    </aside>
  );
}
