import Link from "next/link";

import type { DVFTransaction } from "@/lib/api";

interface ResultCardProps {
  transaction: DVFTransaction;
  active?: boolean;
  onHover?: () => void;
}

export function ResultCard({ transaction, active, onHover }: ResultCardProps) {
  return (
    <Link
      href={`/bien/${encodeURIComponent(transaction.id_mutation)}`}
      className={`result-item${active ? " result-item--active" : ""}`}
      onMouseEnter={onHover}
    >
      <p className="result-item__title">
        {transaction.commune} ({transaction.code_postal})
      </p>
      <p className="result-item__meta">
        {transaction.type_local ?? "Bien"}
        {transaction.surface_reelle_bati !== null
          ? ` · ${transaction.surface_reelle_bati} m²`
          : ""}
        {" · "}
        {new Date(transaction.date_mutation).toLocaleDateString("fr-FR")}
      </p>
      <span className="result-item__value">
        {transaction.valeur_fonciere.toLocaleString("fr-FR")} €
      </span>
    </Link>
  );
}
