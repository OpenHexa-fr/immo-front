// Échelle de couleur du prix médian au m², du vert (bas) au rouge (haut) —
// mêmes seuils que la légende affichée sur la carte.
const PRIX_COLOR_STOPS: Array<[number, [number, number, number]]> = [
  [0, [26, 152, 80]],
  [500, [102, 189, 99]],
  [1500, [166, 217, 106]],
  [2750, [254, 224, 139]],
  [4000, [253, 174, 97]],
  [5000, [244, 109, 67]],
  [7000, [215, 48, 39]],
];

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

export function prixToColor(prixM2: number): string {
  const stops = PRIX_COLOR_STOPS;
  if (prixM2 <= stops[0][0]) return rgbToHex(stops[0][1]);
  for (let i = 1; i < stops.length; i++) {
    const [value, color] = stops[i];
    if (prixM2 <= value) {
      const [prevValue, prevColor] = stops[i - 1];
      const t = (prixM2 - prevValue) / (value - prevValue);
      return rgbToHex([
        lerp(prevColor[0], color[0], t),
        lerp(prevColor[1], color[1], t),
        lerp(prevColor[2], color[2], t),
      ]);
    }
  }
  return rgbToHex(stops[stops.length - 1][1]);
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

// Part de passoires énergétiques (0-100 %), même logique de dégradé que le
// prix : vert en dessous de 10 %, rouge au-delà de 50 %.
const DPE_COLOR_STOPS: Array<[number, [number, number, number]]> = [
  [0, [26, 152, 80]],
  [10, [166, 217, 106]],
  [25, [254, 224, 139]],
  [40, [253, 174, 97]],
  [60, [215, 48, 39]],
];

export function dpePartToColor(partPassoire: number): string {
  const stops = DPE_COLOR_STOPS;
  if (partPassoire <= stops[0][0]) return rgbToHex(stops[0][1]);
  for (let i = 1; i < stops.length; i++) {
    const [value, color] = stops[i];
    if (partPassoire <= value) {
      const [prevValue, prevColor] = stops[i - 1];
      const t = (partPassoire - prevValue) / (value - prevValue);
      return rgbToHex([
        lerp(prevColor[0], color[0], t),
        lerp(prevColor[1], color[1], t),
        lerp(prevColor[2], color[2], t),
      ]);
    }
  }
  return rgbToHex(stops[stops.length - 1][1]);
}

export function dpeGradientCss(): string {
  const steps = 20;
  const max = 60;
  const stops = Array.from({ length: steps + 1 }, (_, i) => {
    const part = (i / steps) * max;
    return `${dpePartToColor(part)} ${((i / steps) * 100).toFixed(0)}%`;
  });
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

export function prixGradientCss(): string {
  const steps = 20;
  const maxPrix = 7000;
  const stops = Array.from({ length: steps + 1 }, (_, i) => {
    const prix = (i / steps) * maxPrix;
    return `${prixToColor(prix)} ${((i / steps) * 100).toFixed(0)}%`;
  });
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

export function formatPrixM2(prix: number): string {
  return `${Math.round(prix).toLocaleString("fr-FR")} €`;
}

export function formatPrix(prix: number): string {
  return `${Math.round(prix).toLocaleString("fr-FR")} €`;
}
