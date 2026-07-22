import Link from "next/link";
import { getAllTeachers } from "@/lib/teachers";
import { TeacherCard } from "@/components/TeacherCard";
import { SUBJECTS, LEVELS } from "@/lib/catalog";

export const revalidate = 3600; // ISR : rafraichit la liste des profs chaque heure

export default async function HomePage() {
  const teachers = (await getAllTeachers()).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <span className="inline-block rounded-full bg-white px-4 py-1 text-sm font-medium text-brand-700 shadow-sm">
            -50% immediat, pas dans un an
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Le bon professeur en 3 minutes.
            <span className="text-brand-600"> A moitie prix.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Reservez et payez en ligne. Grace au credit d&apos;impot gere automatiquement
            via l&apos;Avance Immediate URSSAF, vous ne deboursez que la moitie, tout de suite.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/demande"
              className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              Trouver mon professeur
            </Link>
            <Link
              href="/cours/mathematiques/terminale/lyon"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:border-brand-400"
            >
              Parcourir les cours
            </Link>
          </div>
        </div>
      </section>

      {/* Etapes */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900">Comment ca marche</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {[
            ["1", "Dites-nous votre besoin", "Notre assistant qualifie votre demande en 2 minutes."],
            ["2", "Recevez le top 3", "Un matching intelligent vous propose les meilleurs profs."],
            ["3", "Reservez un creneau", "Agenda en temps reel, presentiel ou visio."],
            ["4", "Payez la moitie", "Credit d'impot deduit automatiquement au paiement."],
          ].map(([n, title, desc]) => (
            <div key={n} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
                {n}
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Profs mis en avant */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Nos professeurs les mieux notes</h2>
          <Link href="/demande" className="text-sm font-medium text-brand-600 hover:underline">
            Voir tout
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {teachers.map((t) => (
            <TeacherCard key={t.id} teacher={t} />
          ))}
        </div>
      </section>

      {/* Liens SEO */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-lg font-semibold text-slate-900">Cours populaires</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {SUBJECTS.slice(0, 4).flatMap((s) =>
              LEVELS.slice(1, 4).map((l) => (
                <Link
                  key={`${s.slug}-${l.slug}`}
                  href={`/cours/${s.slug}/${l.slug}/lyon`}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:border-brand-400 hover:text-brand-600"
                >
                  {s.label} {l.label} a Lyon
                </Link>
              )),
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
