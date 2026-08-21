import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { SyncBanner } from "@/components/SyncBanner";

import "./globals.css";

export const metadata: Metadata = {
  title: "OpenHexa Immo",
  description:
    "Recherche de biens immobiliers à partir des données ouvertes DVF, DPE et Sit@del2.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header className="app-header">
          <Link href="/" className="app-header__brand">
            <span className="app-header__logo" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 11.5 12 4l8 7.5" />
                <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
                <path d="M10 20v-5h4v5" />
              </svg>
            </span>
            OpenHexa Immo
          </Link>
          <Link href="/carte" className="app-header__nav-link">
            Carte des prix
          </Link>
          <Link href="/recherche" className="app-header__nav-link">
            Liste des ventes
          </Link>
        </header>
        <SyncBanner />
        <main>{children}</main>
      </body>
    </html>
  );
}
