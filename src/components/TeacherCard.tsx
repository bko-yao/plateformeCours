import Link from "next/link";
import type { Teacher } from "@/lib/teachers";
import { priceBreakdown, euros } from "@/lib/pricing";
import { labelFor, SUBJECTS } from "@/lib/catalog";

export function TeacherCard({
  teacher,
  score,
  reasons,
}: {
  teacher: Teacher;
  score?: number;
  reasons?: string[];
}) {
  const price = priceBreakdown(teacher.hourlyRate);
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">
              {teacher.firstName} {teacher.lastName[0]}.
            </h3>
            {teacher.verified && (
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Verifie
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-slate-500">
            {teacher.subjects.map((s) => labelFor(SUBJECTS, s)).join(" · ")}
          </p>
        </div>
        {typeof score === "number" && (
          <div className="shrink-0 rounded-lg bg-brand-50 px-3 py-1 text-center">
            <div className="text-lg font-bold text-brand-700">{score}%</div>
            <div className="text-[10px] uppercase text-brand-500">compat.</div>
          </div>
        )}
      </div>

      <p className="mt-3 line-clamp-3 text-sm text-slate-600">{teacher.bio}</p>

      <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
        <span className="font-medium text-amber-600">★ {teacher.rating.toFixed(1)}</span>
        <span className="text-slate-400">({teacher.reviewsCount} avis)</span>
      </div>

      {reasons && reasons.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-slate-600">
          {reasons.slice(0, 3).map((r) => (
            <li key={r} className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> {r}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
        <div>
          <div className="text-sm text-slate-400 line-through">{euros(price.total)}/h</div>
          <div className="text-xl font-bold text-brand-700">
            {euros(price.reste)}/h
            <span className="ml-1 text-xs font-normal text-slate-500">apres credit d&apos;impot</span>
          </div>
        </div>
        <Link
          href={`/reserver/${teacher.id}`}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Reserver
        </Link>
      </div>
    </div>
  );
}
