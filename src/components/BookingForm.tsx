"use client";

import { useMemo, useState } from "react";
import { euros } from "@/lib/pricing";

type Props = {
  teacherId: string;
  teacherName: string;
  hourlyRate: number;
  reste: number;
  credit: number;
  mode: string; // "presentiel" | "visio" | "both"
};

// Genere quelques creneaux a venir (demo). En production, ces creneaux
// proviennent du moteur de disponibilites (table Availability) avec
// verrou anti-double-reservation. (Voir CONCEPTION.md, section 3.4.)
function upcomingSlots(): { iso: string; label: string }[] {
  const slots: { iso: string; label: string }[] = [];
  const now = new Date();
  const days = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];
  for (let d = 1; d <= 5; d++) {
    for (const hour of [17, 18]) {
      const dt = new Date(now);
      dt.setDate(now.getDate() + d);
      dt.setHours(hour, 0, 0, 0);
      slots.push({
        iso: dt.toISOString(),
        label: `${days[dt.getDay()]} ${dt.getDate()}/${dt.getMonth() + 1} a ${hour}h`,
      });
    }
  }
  return slots;
}

export function BookingForm({ teacherId, teacherName, reste, credit, mode }: Props) {
  const slots = useMemo(upcomingSlots, []);
  const [slot, setSlot] = useState(slots[0]?.iso ?? "");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [chosenMode, setChosenMode] = useState(mode === "both" ? "visio" : mode);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ restACharge: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId,
          studentName,
          studentEmail,
          slotStart: slot,
          durationMin: 60,
          mode: chosenMode,
        }),
      });
      if (!res.ok) throw new Error("La reservation a echoue. Verifiez vos informations.");
      const data = await res.json();
      setDone({ restACharge: data.restACharge });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <h2 className="text-lg font-semibold text-emerald-800">Reservation confirmee !</h2>
        <p className="mt-2 text-sm text-emerald-700">
          Votre cours avec {teacherName} est reserve. Vous ne paierez que{" "}
          <strong>{euros(done.restACharge)}</strong> grace au credit d&apos;impot.
        </p>
        <p className="mt-2 text-xs text-emerald-600">
          (Demo : le paiement Stripe et l&apos;Avance Immediate URSSAF seront branches en phase 2.)
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Reserver un cours (1h)</h2>

      <div className="mt-4">
        <span className="mb-1 block text-sm font-medium text-slate-700">Creneau</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {slots.map((s) => (
            <button
              key={s.iso}
              type="button"
              onClick={() => setSlot(s.iso)}
              className={`rounded-lg border px-3 py-2 text-sm ${
                slot === s.iso
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 text-slate-600 hover:border-brand-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {mode === "both" && (
        <div className="mt-4">
          <span className="mb-1 block text-sm font-medium text-slate-700">Format</span>
          <div className="flex gap-2">
            {["presentiel", "visio"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setChosenMode(m)}
                className={`rounded-lg border px-4 py-2 text-sm ${
                  chosenMode === m
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {m === "presentiel" ? "A domicile" : "En visio"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Nom de l'eleve"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <input
          type="email"
          value={studentEmail}
          onChange={(e) => setStudentEmail(e.target.value)}
          placeholder="Email"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
      </div>

      <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm">
        <div className="flex justify-between text-slate-500">
          <span>Credit d&apos;impot (50%)</span>
          <span>- {euros(credit)}</span>
        </div>
        <div className="mt-1 flex justify-between text-base font-semibold text-slate-900">
          <span>Reste a charge</span>
          <span className="text-brand-700">{euros(reste)}</span>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={loading || !slot || !studentName || !studentEmail}
        className="mt-5 w-full rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? "Confirmation..." : `Confirmer et payer ${euros(reste)}`}
      </button>
    </div>
  );
}
