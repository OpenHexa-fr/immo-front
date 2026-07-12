"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { searchDVF, type DVFTransaction } from "@/lib/api";
import { formatDistanceKm, haversineKm } from "@/lib/geo";

interface PreviewItem {
  transaction: DVFTransaction;
  distanceKm: number | null;
}

export function NearbyPreview() {
  const [items, setItems] = useState<PreviewItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadGeneric() {
      try {
        const results = await searchDVF({ tri: "recent", size: 3 });
        if (!cancelled) {
          setItems(results.items.map((transaction) => ({ transaction, distanceKm: null })));
        }
      } catch {
        if (!cancelled) setItems([]);
      }
    }

    if (!navigator.geolocation) {
      void loadGeneric();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const here = { lat: position.coords.latitude, lon: position.coords.longitude };
        try {
          const results = await searchDVF({
            lat: here.lat,
            lon: here.lon,
            radius_km: 20,
            tri: "recent",
            size: 3,
          });
          if (!cancelled) {
            setItems(
              results.items.map((transaction) => ({
                transaction,
                distanceKm: transaction.location ? haversineKm(here, transaction.location) : null,
              })),
            );
          }
        } catch {
          if (!cancelled) void loadGeneric();
        }
      },
      () => {
        void loadGeneric();
      },
      { timeout: 4000 },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <>
      <p className="hero__preview-title">Transactions récentes près de chez vous</p>
      <div className="hero__preview">
        {items.map((item, index) => (
          <Link
            key={`${item.transaction.id_mutation}-${index}`}
            href={`/bien/${encodeURIComponent(item.transaction.id_mutation)}`}
            className="hero__preview-card"
          >
            <p className="result-item__title">
              {item.transaction.commune} ({item.transaction.code_postal})
            </p>
            <p className="result-item__meta">
              {item.transaction.valeur_fonciere.toLocaleString("fr-FR")} €
              {item.distanceKm !== null ? ` · ${formatDistanceKm(item.distanceKm)}` : ""}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
