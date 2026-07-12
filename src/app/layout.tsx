import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

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
            <span className="app-header__logo">OH</span>
            OpenHexa Immo
          </Link>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
