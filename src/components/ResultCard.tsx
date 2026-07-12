import Link from "next/link";

import { DPEBadge } from "@/components/DPEBadge";
import { formatDistanceKm } from "@/lib/geo";
import type { DVFTransaction } from "@/lib/api";

interface ResultCardProps {
  transaction: DVFTransaction;
  active?: boolean;
  onHover?: () => void;
  distanceKm?: number | null;
}

export function ResultCard({ transaction, active, onHover, distanceKm }: ResultCardProps) {
  const directionsUrl = transaction.location
    ? `https://www.openstreetmap.org/directions?to=${transaction.location.lat}%2C${transaction.location.lon}`
    : null;

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
        {distanceKm !== null && distanceKm !== undefined ? ` · ${formatDistanceKm(distanceKm)}` : ""}
      </p>
      <div className="result-item__badges">
        <DPEBadge etiquette={transaction.etiquette_dpe} />
      </div>
      <div className="result-item__footer">
        <span className="result-item__value">
          {transaction.valeur_fonciere.toLocaleString("fr-FR")} €
        </span>
        {directionsUrl && (
          <span
            className="result-item__cta"
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              window.open(directionsUrl, "_blank", "noopener,noreferrer");
            }}
          >
            Itinéraire
          </span>
        )}
      </div>
    </Link>
  );
}
