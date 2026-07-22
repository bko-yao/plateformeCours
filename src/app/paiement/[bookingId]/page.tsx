import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getBooking } from "@/lib/bookings";
import { creditImpot, euros } from "@/lib/pricing";
import { isStripeConfigured } from "@/lib/stripe";
import { PayButton } from "@/components/PayButton";

export const metadata: Metadata = { title: "Paiement" };
export const dynamic = "force-dynamic"; // statut de paiement toujours a jour

export default async function PaiementPage({
  params,
  searchParams,
}: {
  params: { bookingId: string };
  searchParams: { annule?: string };
}) {
  const booking = await getBooking(params.bookingId);
  if (!booking) notFound();

  const teacherName = `${booking.teacher.firstName} ${booking.teacher.lastName[0]}.`;
  const credit = creditImpot(booking.amount);
  const paid = booking.status === "paid";

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">
        {paid ? "Paiement confirme" : "Finaliser le paiement"}
      </h1>

      {/* Recapitulatif */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Recapitulatif
        </h2>
        <dl className="mt-4 space-y-3 text-sm">
          <Row label="Professeur" value={teacherName} />
          <Row
            label="Creneau"
            value={booking.slotStart.toLocaleString("fr-FR", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          />
          <Row label="Format" value={booking.mode === "visio" ? "En visio" : "A domicile"} />
          <Row label="Duree" value="1 heure" />
        </dl>

        <div className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Tarif du cours</span>
            <span>{euros(booking.amount)}</span>
          </div>
          <div className="flex justify-between text-emerald-600">
            <span>Credit d&apos;impot (50 %)</span>
            <span>- {euros(credit)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
            <span>Reste a charge</span>
            <span className="text-brand-700">{euros(booking.restACharge)}</span>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="mt-6">
        {paid ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="font-semibold text-emerald-800">
              Merci {booking.studentName} ! Votre cours est reserve et paye.
            </p>
            <p className="mt-1 text-sm text-emerald-700">
              Un email de confirmation vous a ete envoye (a venir).
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Retour a l&apos;accueil
            </Link>
          </div>
        ) : (
          <>
            {searchParams.annule && (
              <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                Paiement annule. Vous pouvez reessayer ci-dessous.
              </p>
            )}
            <PayButton bookingId={booking.id} reste={booking.restACharge} />
            {!isStripeConfigured() && (
              <p className="mt-4 rounded-lg bg-slate-100 p-3 text-center text-xs text-slate-500">
                Mode demo : aucune cle Stripe configuree, le paiement est simule.
                Renseignez <code>STRIPE_SECRET_KEY</code> pour activer le paiement reel.
              </p>
            )}
          </>
        )}
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
