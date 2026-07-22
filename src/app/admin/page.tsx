import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { euros } from "@/lib/pricing";
import { labelFor, SUBJECTS, LEVELS, CITIES } from "@/lib/catalog";

export const metadata: Metadata = { title: "Back-office" };
export const dynamic = "force-dynamic"; // toujours les donnees fraiches

export default async function AdminPage() {
  const [leads, bookings, teacherCount] = await Promise.all([
    prisma.lead.findMany({
      include: { needProfile: true },
      orderBy: [{ urgencyScore: "desc" }, { createdAt: "desc" }],
      take: 50,
    }),
    prisma.booking.findMany({
      include: { teacher: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.teacher.count(),
  ]);

  const caReste = bookings.reduce((s, b) => s + b.restACharge, 0);
  const caTotal = bookings.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Back-office</h1>
      <p className="mt-1 text-sm text-slate-500">
        Vue de pilotage — leads priorises par le scoring, reservations et finances.
      </p>

      {/* KPIs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Kpi label="Leads qualifies" value={String(leads.length)} />
        <Kpi label="Reservations" value={String(bookings.length)} />
        <Kpi label="Professeurs" value={String(teacherCount)} />
        <Kpi label="Volume (reste a charge)" value={euros(caReste)} sub={`${euros(caTotal)} brut`} />
      </div>

      {/* Leads */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Pipeline leads</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-slate-500">
              <tr>
                <Th>Contact</Th>
                <Th>Besoin</Th>
                <Th>Urgence</Th>
                <Th>Valeur</Th>
                <Th>Statut</Th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Aucun lead pour l&apos;instant. Testez le tunnel via « Demander un cours ».
                  </td>
                </tr>
              )}
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{l.contactName}</div>
                    <div className="text-xs text-slate-400">{l.contactEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {l.needProfile
                      ? `${labelFor(SUBJECTS, l.needProfile.subject)} · ${labelFor(
                          LEVELS,
                          l.needProfile.level,
                        )} · ${labelFor(CITIES, l.needProfile.city)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBadge value={l.urgencyScore} />
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBadge value={l.valueScore} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Reservations */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Reservations recentes</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-slate-500">
              <tr>
                <Th>Eleve</Th>
                <Th>Professeur</Th>
                <Th>Creneau</Th>
                <Th>Reste a charge</Th>
                <Th>Statut</Th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Aucune reservation pour l&apos;instant.
                  </td>
                </tr>
              )}
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-slate-900">{b.studentName}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {b.teacher.firstName} {b.teacher.lastName[0]}.
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {b.slotStart.toLocaleString("fr-FR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium text-brand-700">{euros(b.restACharge)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      {sub && <div className="text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

function ScoreBadge({ value }: { value: number }) {
  const color =
    value >= 70 ? "bg-red-50 text-red-700" : value >= 45 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600";
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${color}`}>{value}</span>;
}
