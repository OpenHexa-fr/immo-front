"use client";

import { prixGradientCss } from "@/lib/prixColor";

export function CarteLegend() {
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
