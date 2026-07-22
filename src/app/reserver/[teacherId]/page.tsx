import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTeacher } from "@/lib/teachers";
import { priceBreakdown } from "@/lib/pricing";
import { BookingForm } from "@/components/BookingForm";
import { labelFor, SUBJECTS, LEVELS } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: {
  params: { teacherId: string };
}): Promise<Metadata> {
  const t = await getTeacher(params.teacherId);
  if (!t) return { title: "Professeur introuvable" };
  return { title: `Reserver un cours avec ${t.firstName} ${t.lastName[0]}.` };
}

export default async function ReserverPage({
  params,
}: {
  params: { teacherId: string };
}) {
  const teacher = await getTeacher(params.teacherId);
  if (!teacher) notFound();

  const price = priceBreakdown(teacher.hourlyRate);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="grid gap-8 md:grid-cols-5">
        {/* Profil */}
        <div className="md:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {teacher.firstName} {teacher.lastName[0]}.
              </h1>
              {teacher.verified && (
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                  Verifie
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-amber-600">
              ★ {teacher.rating.toFixed(1)}{" "}
              <span className="text-slate-400">({teacher.reviewsCount} avis)</span>
            </p>
            <p className="mt-3 text-sm text-slate-600">{teacher.bio}</p>

            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Matieres" value={teacher.subjects.map((s) => labelFor(SUBJECTS, s)).join(", ")} />
              <Row label="Niveaux" value={teacher.levels.map((l) => labelFor(LEVELS, l)).join(", ")} />
              <Row
                label="Format"
                value={
                  teacher.mode === "both"
                    ? "Domicile ou visio"
                    : teacher.mode === "visio"
                      ? "Visio"
                      : "A domicile"
                }
              />
            </dl>
          </div>
        </div>

        {/* Reservation */}
        <div className="md:col-span-3">
          <BookingForm
            teacherId={teacher.id}
            teacherName={`${teacher.firstName} ${teacher.lastName[0]}.`}
            hourlyRate={teacher.hourlyRate}
            reste={price.reste}
            credit={price.credit}
            mode={teacher.mode}
          />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right text-slate-700">{value}</dd>
    </div>
  );
}
