import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

// Webhook Stripe : source de verite du paiement. Quand la session Checkout
// est completee, on passe la reservation en "paid". La verification de
// signature garantit que l'appel vient bien de Stripe.
//
// Config Stripe : Dashboard -> Developers -> Webhooks -> endpoint
//   https://<domaine>/api/webhooks/stripe  (evenement checkout.session.completed)
// puis renseigner STRIPE_WEBHOOK_SECRET.

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe non configure" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  const payload = await req.text(); // corps brut requis pour la verification
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.error("Webhook Stripe: signature invalide", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { bookingId?: string } };
    const bookingId = session.metadata?.bookingId;
    if (bookingId) {
      await prisma.booking
        .update({ where: { id: bookingId }, data: { status: "paid" } })
        .catch((e) => console.error("Webhook: maj reservation echouee", e));
    }
  }

  return NextResponse.json({ received: true });
}
