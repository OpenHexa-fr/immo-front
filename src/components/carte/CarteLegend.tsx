"use client";

import { dpeGradientCss, prixGradientCss } from "@/lib/prixColor";

import type { VueCarte } from "./FiltresVentes";

interface CarteLegendProps {
  vue?: VueCarte;
}

export function CarteLegend({ vue = "prix" }: CarteLegendProps) {
  if (vue === "dpe") {
    return (
      <div className="carte-legend">
        <div className="carte-legend__title">
          <span>Passoires énergétiques</span>
          <span>% des ventes avec DPE</span>
        </div>
        <div className="carte-legend__bar" style={{ background: dpeGradientCss() }} />
        <div className="carte-legend__scale">
          <span>0 %</span>
          <span>25 %</span>
          <span>&gt; 60 %</span>
        </div>
      </div>
    );
  }

  return (
    <div className="carte-legend">
      <div className="carte-legend__title">
        <span>Prix au m²</span>
        <span>France</span>
      </div>
      <div className="carte-legend__bar" style={{ background: prixGradientCss() }} />
      <div className="carte-legend__scale">
        <span>&lt; 500 €</span>
        <span>2 750 €</span>
        <span>&gt; 5 000 €</span>
      </div>
    </div>
  );
}
