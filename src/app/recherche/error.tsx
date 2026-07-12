"use client";

interface RechercheErrorProps {
  error: Error;
  reset: () => void;
}

export default function RechercheError({ reset }: RechercheErrorProps) {
  return (
    <div className="state-banner state-banner--error" role="alert">
      <p>
        Impossible de charger les résultats. Vérifiez votre connexion et réessayez.
      </p>
      <span className="state-banner__retry" onClick={() => reset()} role="button" tabIndex={0}>
        Réessayer
      </span>
    </div>
  );
}
