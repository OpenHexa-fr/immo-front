"use client";

import { useEffect, useState } from "react";

import { getStatus } from "@/lib/api";

const POLL_INTERVAL_MS = 15_000;

export function SyncBanner() {
  const [ready, setReady] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function checkStatus() {
      try {
        const status = await getStatus();
        if (cancelled) return;
        setReady(status.dvf);
        if (!status.dvf) {
          timer = setTimeout(checkStatus, POLL_INTERVAL_MS);
        }
      } catch {
        if (!cancelled) timer = setTimeout(checkStatus, POLL_INTERVAL_MS);
      }
    }

    checkStatus();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (ready) return null;

  return (
    <div className="sync-banner" role="status">
      Les données sont en cours de synchronisation, certains résultats peuvent être incomplets
      pour le moment.
    </div>
  );
}
