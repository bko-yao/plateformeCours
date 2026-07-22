// Client Stripe cote serveur.
//
// La cle secrete n'est jamais exposee au navigateur. Si elle est absente
// (ex. environnement de demo sans compte Stripe), `getStripe()` renvoie null
// et l'application bascule en "mode demo" (paiement simule) plutot que
// d'echouer. Voir CONCEPTION.md, section 3.5.
import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!cached) cached = new Stripe(key);
  return cached;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
