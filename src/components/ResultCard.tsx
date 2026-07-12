import Link from "next/link";

import type { DVFTransaction } from "@/lib/api";

interface ResultCardProps {
  transaction: DVFTransaction;
}

export function ResultCard({ transaction }: ResultCardProps) {
  return (
    <Link href={`/bien/${encodeURIComponent(transaction.id_mutation)}`} className="result-card">
      <h3>
        {transaction.commune} ({transaction.code_postal})
      </h3>
      <p>
        {transaction.type_local ?? "Bien"} —{" "}
        {transaction.valeur_fonciere.toLocaleString("fr-FR")} €
      </p>
      {transaction.surface_reelle_bati !== null && <p>{transaction.surface_reelle_bati} m²</p>}
      <p>{new Date(transaction.date_mutation).toLocaleDateString("fr-FR")}</p>
    </Link>
  );
}
