const VALID_LETTERS = new Set(["A", "B", "C", "D", "E", "F", "G"]);

interface DPEBadgeProps {
  etiquette: string | null;
}

export function DPEBadge({ etiquette }: DPEBadgeProps) {
  if (!etiquette || !VALID_LETTERS.has(etiquette)) return null;

  return (
    <span className={`dpe-badge dpe-badge--${etiquette}`} title={`Diagnostic de performance énergétique : ${etiquette}`}>
      {etiquette}
    </span>
  );
}
