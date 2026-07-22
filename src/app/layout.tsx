import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: {
    default: "Preceptio — Cours particuliers, -50% grace au credit d'impot",
    template: "%s | Preceptio",
  },
  description:
    "Trouvez le bon professeur en 3 minutes, reservez en ligne et ne payez que la moitie grace au credit d'impot gere automatiquement.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <main className="min-h-[70vh]">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500">
            <p className="font-semibold text-slate-700">Preceptio</p>
            <p className="mt-1 max-w-2xl">
              Plateforme de cours particuliers declaree Services a la Personne. Credit
              d&apos;impot de 50% gere via l&apos;Avance Immediate URSSAF.
            </p>
            <p className="mt-3">
              <Link href="/demande" className="text-brand-600 hover:underline">
                Demander un cours
              </Link>{" "}
              · <span>Projet de demonstration (MVP)</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
