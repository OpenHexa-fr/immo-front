import { notFound } from "next/navigation";

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

  return (
    <div className="detail">
      <h1>Mutation {params.id}</h1>
      <div className="detail__map">
        <Map markers={markers} />
      </div>
      {lots.map((lot, index) => (
        <div className="detail__card" key={`${lot.id_mutation}-${index}`}>
          <p className="result-item__title">
            {lot.type_local ?? "Bien"} — {lot.valeur_fonciere.toLocaleString("fr-FR")} €
          </p>
          <p className="result-item__meta">
            {lot.commune} ({lot.code_postal})
            {lot.surface_reelle_bati !== null ? ` · ${lot.surface_reelle_bati} m²` : ""}
            {" · "}
            {new Date(lot.date_mutation).toLocaleDateString("fr-FR")}
          </p>
        </div>
      ))}
    </div>
  );
}
