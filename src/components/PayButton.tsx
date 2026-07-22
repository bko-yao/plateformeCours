"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { euros } from "@/lib/pricing";

// Declenche le paiement : appelle /api/checkout puis redirige vers Stripe
// Checkout. En mode demo (pas de cle Stripe), l'API marque la reservation
// payee et on rafraichit la page.
export function PayButton({ bookingId, reste }: { bookingId: string; reste: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Le paiement a echoue.");

      if (data.mode === "stripe" && data.url) {
        window.location.href = data.url; // redirection vers Stripe Checkout
      } else if (data.mode === "demo") {
        router.refresh(); // paiement simule -> la page affiche l'etat "paye"
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={pay}
        disabled={loading}
        className="w-full rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? "Redirection..." : `Payer ${euros(reste)} avec Stripe`}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <p className="mt-3 text-center text-xs text-slate-400">
        Paiement securise. Vous serez redirige vers Stripe.
      </p>
    </div>
  );
}
