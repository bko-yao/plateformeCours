import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  SUBJECTS,
  LEVELS,
  CITIES,
  labelFor,
  isValidSlug,
} from "@/lib/catalog";
import { getAllTeachers } from "@/lib/teachers";
import { TeacherCard } from "@/components/TeacherCard";
import { resteACharge } from "@/lib/pricing";

type Params = { subject: string; level: string; city: string };

export const revalidate = 3600; // ISR : pages SEO regenerees chaque heure

// Pages programmatiques : matiere x niveau x ville. Pre-generees au build
// pour un SEO optimal (voir CONCEPTION.md, section 3.1).
export function generateStaticParams() {
  const params: Params[] = [];
  for (const s of SUBJECTS)
    for (const l of LEVELS)
      for (const c of CITIES)
        params.push({ subject: s.slug, level: l.slug, city: c.slug });
  return params;
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const subject = labelFor(SUBJECTS, params.subject);
  const level = labelFor(LEVELS, params.level);
  const city = labelFor(CITIES, params.city);
  const title = `Cours de ${subject} ${level} a ${city}`;
  return {
    title,
    description: `Trouvez un professeur de ${subject} pour un eleve de ${level} a ${city}. Reservation en ligne, -50% grace au credit d'impot.`,
    alternates: { canonical: `/cours/${params.subject}/${params.level}/${params.city}` },
    openGraph: { title, type: "website" },
  };
}

export default async function CoursPage({ params }: { params: Params }) {
  if (
    !isValidSlug(SUBJECTS, params.subject) ||
    !isValidSlug(LEVELS, params.level) ||
    !isValidSlug(CITIES, params.city)
  ) {
    notFound();
  }

  const subject = labelFor(SUBJECTS, params.subject);
  const level = labelFor(LEVELS, params.level);
  const city = labelFor(CITIES, params.city);

  const all = await getAllTeachers();
  const matches = all.filter(
    (t) =>
      t.subjects.includes(params.subject) &&
      t.levels.includes(params.level) &&
      (t.mode === "visio" || t.cities.includes(params.city)),
  );

  const minReste = matches.length
    ? Math.min(...matches.map((t) => resteACharge(t.hourlyRate)))
    : null;

  // Donnees structurees Schema.org pour le SEO.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `Cours de ${subject} ${level} a ${city}`,
    description: `Cours particuliers de ${subject} pour ${level} a ${city}.`,
    provider: { "@type": "Organization", name: "Preceptio" },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-600">
          Accueil
        </Link>{" "}
        / <span>Cours de {subject}</span> / <span>{level}</span> / <span>{city}</span>
      </nav>

      <h1 className="mt-3 text-3xl font-bold text-slate-900">
        Cours de {subject} {level} a {city}
      </h1>
      <p className="mt-3 max-w-3xl text-slate-600">
        {matches.length} professeur{matches.length > 1 ? "s" : ""} de {subject} disponible
        {matches.length > 1 ? "s" : ""} pour un eleve de {level} a {city}.
        {minReste !== null && (
          <>
            {" "}
            A partir de <span className="font-semibold text-brand-700">{minReste} €/h</span> apres
            credit d&apos;impot.
          </>
        )}
      </p>

      <div className="mt-6">
        <Link
          href="/demande"
          className="inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Etre mis en relation en 3 minutes
        </Link>
      </div>

      {matches.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Aucun professeur ne correspond encore a cette combinaison.{" "}
          <Link href="/demande" className="text-brand-600 hover:underline">
            Laissez-nous votre besoin
          </Link>{" "}
          et nous vous rappelons.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((t) => (
            <TeacherCard key={t.id} teacher={t} />
          ))}
        </div>
      )}
    </div>
  );
}
