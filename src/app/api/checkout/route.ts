import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getBooking } from "@/lib/bookings";
import { getStripe } from "@/lib/stripe";

// Cree une session Stripe Checkout pour une reservation.
// Le montant debite est le RESTE A CHARGE (apres credit d'impot 50 %) :
// c'est ce que le client paie reellement. L'Avance Immediate URSSAF (prise
// en charge des 50 % restants) est un flux distinct, hors MVP.
// (Voir CONCEPTION.md, section 3.5.)

const schema = z.object({ bookingId: z.string().min(1) });

function baseUrl(req: Request): string {
  const origin = req.headers.get("origin");
  if (origin) return origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bookingId requis" }, { status: 400 });
  }

  const booking = await getBooking(parsed.data.bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Reservation introuvable" }, { status: 404 });
  }
  if (booking.status === "paid") {
    return NextResponse.json({ error: "Reservation deja payee" }, { status: 409 });
  }

  const stripe = getStripe();

  // Mode demo : pas de cle Stripe -> on marque la reservation payee directement
  // pour que le parcours reste demontrable sans compte Stripe.
  if (!stripe) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "paid" },
    });
    return NextResponse.json({ mode: "demo", paid: true });
  }

  const url = baseUrl(req);
  const teacherName = `${booking.teacher.firstName} ${booking.teacher.lastName[0]}.`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: booking.studentEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: booking.restACharge * 100, // en centimes
          product_data: {
            name: `Cours particulier avec ${teacherName}`,
            description: "Reste a charge apres credit d'impot 50 %",
          },
        },
      },
    ],
    metadata: { bookingId: booking.id },
    success_url: `${url}/paiement/${booking.id}/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${url}/paiement/${booking.id}?annule=1`,
  });

  return NextResponse.json({ mode: "stripe", url: session.url });
}
