"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { DPEBadge } from "@/components/DPEBadge";
import { searchDVF, type DVFTransaction } from "@/lib/api";
import { formatPrix, formatPrixM2 } from "@/lib/prixColor";

const PAGE = 25;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR");
}

export function ListeVentes() {
  const searchParams = useSearchParams();
  const commune = searchParams.get("commune") ?? undefined;
  const codePostal = searchParams.get("code_postal") ?? undefined;

  const [items, setItems] = useState<DVFTransaction[]>([]);
  const [curseur, setCurseur] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [totalPlafonne, setTotalPlafonne] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(false);

  const charger = useCallback(
    async (suite: boolean, signal?: AbortSignal) => {
      setChargement(true);
      setErreur(false);
      try {
        const reponse = await searchDVF(
          {
            commune,
            code_postal: codePostal,
            tri: "recent",
            size: PAGE,
            // La pagination par curseur existe côté API depuis le lot A3 sans
            // qu'aucun écran ne s'en serve : c'est ici qu'elle prend son sens.
            cursor: suite ? (curseur ?? undefined) : undefined,
          },
          { signal },
        );
        setItems((precedents) => (suite ? [...precedents, ...reponse.items] : reponse.items));
        setCurseur(reponse.next_cursor ?? null);
        setTotal(reponse.total);
        setTotalPlafonne(reponse.total_relation === "gte");
      } catch (cause) {
        if ((cause as { name?: string }).name !== "AbortError") setErreur(true);
      } finally {
        setChargement(false);
      }
    },
    [commune, codePostal, curseur],
  );

  useEffect(() => {
    const controller = new AbortController();
    setItems([]);
    setCurseur(null);
    charger(false, controller.signal);
    return () => controller.abort();
    // `charger` dépend du curseur, qu'on ne veut pas suivre ici : seule une
    // nouvelle recherche doit réinitialiser la liste.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commune, codePostal]);

  const intitule = commune ?? codePostal ?? "France entière";

  return (
    <section className="liste">
      <header className="liste__entete">
        <h1 className="liste__titre">Ventes — {intitule}</h1>
        {total !== null && (
          <p className="liste__total">
            {totalPlafonne ? "plus de " : ""}
            {total.toLocaleString("fr-FR")} vente{total > 1 ? "s" : ""}
          </p>
        )}
      </header>

      {erreur && <p className="liste__etat">Impossible de charger les ventes.</p>}
      {!erreur && items.length === 0 && !chargement && (
        <p className="liste__etat">Aucune vente ne correspond à cette recherche.</p>
      )}

      <ul className="liste__items">
        {items.map((vente, index) => (
          <li className="liste__item" key={`${vente.id_mutation}-${index}`}>
            <Link className="liste__lien" href={`/bien/${encodeURIComponent(vente.id_mutation)}`}>
              <div className="liste__ligne">
                <span className="liste__bien">
                  {vente.type_local ?? "Bien"}
                  {vente.surface_reelle_bati !== null && ` · ${vente.surface_reelle_bati} m²`}
                  {vente.nombre_pieces_principales !== null &&
                    ` · ${vente.nombre_pieces_principales} p.`}{" "}
                  <DPEBadge etiquette={vente.etiquette_dpe} typeLocal={vente.type_local} />
                </span>
                <span className="liste__prix">
                  {formatPrix(vente.valeur_fonciere)}
                  {vente.prix_m2 !== null && (
                    <span className="liste__prix-m2">{formatPrixM2(vente.prix_m2)}/m²</span>
                  )}
                </span>
              </div>
              <p className="liste__adresse">
                {vente.adresse ? `${vente.adresse}, ` : ""}
                {vente.code_postal} {vente.commune} — {formatDate(vente.date_mutation)}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {curseur && (
        <button
          type="button"
          className="liste__plus"
          onClick={() => charger(true)}
          disabled={chargement}
        >
          {chargement ? "Chargement…" : "Afficher plus de ventes"}
        </button>
      )}
    </section>
  );
}
