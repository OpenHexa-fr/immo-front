import { notFound } from "next/navigation";

import { DPEBadge } from "@/components/DPEBadge";
import { Map } from "@/components/Map";
import { getDVFByMutation } from "@/lib/api";

interface BienPageProps {
  params: { id: string };
}

export default async function BienPage({ params }: BienPageProps) {
  const lots = await getDVFByMutation(params.id);

  if (lots.length === 0) {
    notFound();
  }

  const markers = lots
    .map((lot, index) => ({ lot, index }))
    .filter(({ lot }) => lot.location !== null)
    .map(({ lot, index }) => ({
      id: `${lot.id_mutation}-${index}`,
      lat: lot.location!.lat,
      lon: lot.location!.lon,
      label: `${lot.commune} — ${lot.valeur_fonciere.toLocaleString("fr-FR")} €`,
    }));

  const [first] = lots;

  return (
    <div className="detail">
      <div className="detail__sticky-header">
        <h1>Mutation {params.id}</h1>
      </div>
      <div className="detail__lots-header">
        <p className="result-item__meta">
          {first.commune} ({first.code_postal}) ·{" "}
          {new Date(first.date_mutation).toLocaleDateString("fr-FR")}
        </p>
        <p className="result-item__meta">
          {lots.length} lot{lots.length > 1 ? "s" : ""} dans cette mutation
        </p>
      </div>
      <div className="detail__map">
        <Map markers={markers} />
      </div>
      <div className="detail__card">
        {lots.map((lot, index) => (
          <div className="lot-row" key={`${lot.id_mutation}-${index}`}>
            <span className="lot-row__label">
              {lot.type_local ?? "Bien"}
              {lot.surface_reelle_bati !== null ? ` · ${lot.surface_reelle_bati} m²` : ""}
              {lot.etiquette_dpe && (
                <>
                  {" "}
                  <DPEBadge etiquette={lot.etiquette_dpe} />
                </>
              )}
            </span>
            <span className="lot-row__value">
              {lot.valeur_fonciere.toLocaleString("fr-FR")} €
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
