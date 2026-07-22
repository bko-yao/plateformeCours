"use client";

import { useState } from "react";
import Link from "next/link";
import { SUBJECTS, LEVELS, CITIES, GOALS, MODES } from "@/lib/catalog";
import { resteACharge, euros } from "@/lib/pricing";

type Match = {
  teacherId: string;
  score: number;
  reasons: string[];
  firstName: string;
  lastName: string;
  rating: number;
  hourlyRate: number;
  verified: boolean;
};

type Result = {
  leadId: string;
  scores: { urgency: number; value: number };
  matches: Match[];
};

const STEPS = ["Besoin", "Contexte", "Contact"] as const;

export default function DemandePage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const [form, setForm] = useState({
    subject: SUBJECTS[0].slug,
    level: LEVELS[2].slug,
    city: CITIES[1].slug,
    goal: GOALS[0].slug,
    mode: MODES[2].slug,
    hoursPerWeek: 1,
    budgetMax: "",
    deadline: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        subject: form.subject,
        level: form.level,
        city: form.city,
        goal: form.goal,
        mode: form.mode,
        hoursPerWeek: Number(form.hoursPerWeek),
        contactName: form.contactName,
        contactEmail: form.contactEmail,
      };
      if (form.contactPhone) payload.contactPhone = form.contactPhone;
      if (form.budgetMax) payload.budgetMax = Number(form.budgetMax);
      if (form.deadline) payload.deadline = form.deadline;

      const res = await fetch("/api/qualification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          data?.error ?? "Une erreur est survenue. Verifiez vos informations.",
        );
      }
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold text-slate-900">
          Voici vos {result.matches.length} meilleurs professeurs
        </h1>
        <p className="mt-2 text-slate-600">
          Selectionnes selon votre besoin. Le prix affiche est le reste a charge apres credit
          d&apos;impot.
        </p>

        {result.matches.length === 0 && (
          <p className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
            Aucun professeur ne correspond pour l&apos;instant. Nous vous recontactons rapidement.
          </p>
        )}

        <div className="mt-8 space-y-4">
          {result.matches.map((m) => (
            <div
              key={m.teacherId}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {m.firstName} {m.lastName[0]}.
                  </h3>
                  {m.verified && (
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                      Verifie
                    </span>
                  )}
                  <span className="text-sm text-amber-600">★ {m.rating.toFixed(1)}</span>
                </div>
                <ul className="mt-2 space-y-0.5 text-sm text-slate-600">
                  {m.reasons.slice(0, 3).map((r) => (
                    <li key={r}>✓ {r}</li>
                  ))}
                </ul>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-brand-700">{m.score}%</div>
                <div className="text-sm text-slate-400 line-through">{euros(m.hourlyRate)}/h</div>
                <div className="font-semibold text-slate-900">
                  {euros(resteACharge(m.hourlyRate))}/h
                </div>
                <Link
                  href={`/reserver/${m.teacherId}`}
                  className="mt-2 inline-block rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Reserver
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                i <= step ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-500"
              }`}
            >
              {i + 1}
            </div>
            <span className={i <= step ? "text-slate-900" : "text-slate-400"}>{s}</span>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-slate-200" />}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Quel est votre besoin ?</h2>
            <Field label="Matiere">
              <Select value={form.subject} onChange={(v) => set("subject", v)} options={SUBJECTS} />
            </Field>
            <Field label="Niveau de l'eleve">
              <Select value={form.level} onChange={(v) => set("level", v)} options={LEVELS} />
            </Field>
            <Field label="Ville">
              <Select value={form.city} onChange={(v) => set("city", v)} options={CITIES} />
            </Field>
            <Field label="Format">
              <Select value={form.mode} onChange={(v) => set("mode", v)} options={MODES} />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Precisez le contexte</h2>
            <Field label="Objectif">
              <Select value={form.goal} onChange={(v) => set("goal", v)} options={GOALS} />
            </Field>
            <Field label="Heures par semaine">
              <input
                type="number"
                min={1}
                max={20}
                value={form.hoursPerWeek}
                onChange={(e) => set("hoursPerWeek", Number(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Budget max /heure (optionnel)">
              <input
                type="number"
                min={0}
                placeholder="ex: 40"
                value={form.budgetMax}
                onChange={(e) => set("budgetMax", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Echeance (optionnel)">
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
                className="input"
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Comment vous recontacter ?</h2>
            <Field label="Nom">
              <input
                value={form.contactName}
                onChange={(e) => set("contactName", e.target.value)}
                className="input"
                placeholder="Votre nom"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                className="input"
                placeholder="vous@email.fr"
              />
            </Field>
            <Field label="Telephone (optionnel)">
              <input
                value={form.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)}
                className="input"
                placeholder="06 12 34 56 78"
              />
            </Field>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-40"
          >
            Retour
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Continuer
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={loading || !form.contactName || !form.contactEmail}
              className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? "Recherche..." : "Voir mes professeurs"}
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid rgb(203 213 225);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: rgb(52 98 245);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { slug: string; label: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input">
      {options.map((o) => (
        <option key={o.slug} value={o.slug}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
