import { Suspense } from "react";

import { ListeVentes } from "@/components/ListeVentes";

export const metadata = {
  title: "Recherche de ventes — OpenHexa Immo",
};

/**
 * Liste des ventes, en complément de la carte.
 *
 * La carte répond à « combien vaut ce quartier », une liste répond à « qu'est-ce
 * qui s'est vendu, et à quel prix » — beaucoup de gens lisent mieux un tableau.
 * C'est aussi le seul écran qui exploite la pagination par curseur de l'API.
 */
export default function RecherchePage() {
  return (
    <Suspense fallback={<p className="liste__etat">Chargement…</p>}>
      <ListeVentes />
    </Suspense>
  );
}
