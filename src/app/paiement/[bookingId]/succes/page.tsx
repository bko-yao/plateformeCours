import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getBooking } from "@/lib/bookings";
import { getStripe } from "@/lib/stripe";
import { euros } from "@/lib/pricing";

export const metadata: Metadata = { title: "Paiement reussi" };
export const dynamic = "force-dynamic";

// Retour depuis Stripe Checkout. On confirme le paiement en verifiant la
// session (filet de securite si le webhook n'a pas encore ete recu), puis on
// affiche la confirmation.
export default async function SuccesPage({
  params,
  searchParams,
}: {
  params: { bookingId: string };
  searchParams: { session_id?: string };
}) {
  const booking = await getBooking(params.bookingId);
  if (!booking) notFound();

  const stripe = getStripe();
  if (stripe && searchParams.session_id && booking.status !== "paid") {
    try {
      const session = await stripe.checkout.sessions.retrieve(searchParams.session_id);
      if (session.payment_status === "paid" && session.metadata?.bookingId === booking.id) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: "paid" },
        });
        booking.status = "paid";
      }
    } catch (err) {
      console.error("Succes: verification session Stripe echouee", err);
    }
  }

  const teacherName = `${booking.teacher.firstName} ${booking.teacher.lastName[0]}.`;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
        ✓
      </div>
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Paiement reussi</h1>
      <p className="mt-3 text-slate-600">
        Merci {booking.studentName} ! Votre cours avec {teacherName} est reserve.
        Vous avez paye <strong>{euros(booking.restACharge)}</strong> (reste a charge apres
        credit d&apos;impot de 50 %).
      </p>

      {booking.status !== "paid" && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          Le paiement est en cours de confirmation. Vous recevrez un email des validation.
        </p>
      )}

      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
      >
        Retour a l&apos;accueil
      </Link>
    </div>
  );
}
