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
    .filter((lot) => lot.location !== null)
    .map((lot) => ({
      lat: lot.location!.lat,
      lon: lot.location!.lon,
      label: `${lot.commune} — ${lot.valeur_fonciere.toLocaleString("fr-FR")} €`,
    }));

  return (
    <section>
      <h1>Mutation {params.id}</h1>
      <Map markers={markers} />
      <ul>
        {lots.map((lot, index) => (
          <li key={`${lot.id_mutation}-${index}`}>
            <p>
              {lot.type_local ?? "Bien"} — {lot.valeur_fonciere.toLocaleString("fr-FR")} €
            </p>
            {lot.surface_reelle_bati !== null && <p>{lot.surface_reelle_bati} m²</p>}
            <p>
              {lot.commune} ({lot.code_postal})
            </p>
            <p>{new Date(lot.date_mutation).toLocaleDateString("fr-FR")}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
