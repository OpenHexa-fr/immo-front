const VALID_LETTERS = new Set(["A", "B", "C", "D", "E", "F", "G"]);

// Types de local pour lesquels un diagnostic est attendu. Ailleurs — terrains
// nus, dépendances, locaux commerciaux — l'absence d'étiquette est normale et
// ne mérite aucune mention.
const TYPES_AVEC_DPE = new Set(["Maison", "Appartement"]);

interface DPEBadgeProps {
  etiquette: string | null;
  /**
   * Sans ce type, l'absence d'étiquette reste muette. Avec, on distingue « pas
   * de diagnostic attendu » de « diagnostic non rapproché » : le rapprochement
   * DVF↔DPE ne couvre qu'une partie des logements (l'ADEME ne géocode pas tous
   * ses diagnostics, et aucun DPE antérieur n'existe pour une partie des
   * ventes 2021-2022), et une case vide se lirait à tort comme l'absence de
   * DPE du bien.
   */
  typeLocal?: string | null;
  /**
   * True si l'étiquette vient d'un DPE établi après la vente (fenêtre de
   * tolérance de 18 mois, à défaut de DPE antérieur) : le bien a pu être
   * rénové entre-temps, l'étiquette n'est donc pas garantie représentative de
   * son état au moment de la vente.
   */
  apresVente?: boolean | null;
}

export function DPEBadge({ etiquette, typeLocal, apresVente }: DPEBadgeProps) {
  if (etiquette && VALID_LETTERS.has(etiquette)) {
    if (apresVente) {
      return (
        <span
          className={`dpe-badge dpe-badge--${etiquette} dpe-badge--posterieur`}
          title={`Diagnostic de performance énergétique : ${etiquette} — établi après la vente (le bien a pu être rénové depuis)`}
        >
          {etiquette}
          <span className="dpe-badge__marqueur" aria-hidden="true">
            *
          </span>
        </span>
      );
    }
    return (
      <span
        className={`dpe-badge dpe-badge--${etiquette}`}
        title={`Diagnostic de performance énergétique : ${etiquette}`}
      >
        {etiquette}
      </span>
    );
  }

  if (typeLocal && TYPES_AVEC_DPE.has(typeLocal)) {
    return (
      <span
        className="dpe-badge dpe-badge--inconnu"
        title="Aucun diagnostic de performance énergétique n'a pu être rapproché de ce bien. Cela ne signifie pas qu'il n'en possède pas."
      >
        ?
      </span>
    );
  }

  return null;
}
