// Calcul du reste a charge apres credit d'impot "Services a la Personne".
//
// En France, les cours a domicile ouvrent droit a un credit d'impot de 50%.
// Avec l'Avance Immediate URSSAF, le client ne paie que le reste a charge
// tout de suite (au lieu d'attendre le remboursement l'annee suivante).
// C'est l'argument commercial central de la plateforme.

export const CREDIT_RATE = Number(process.env.CREDIT_IMPOT_RATE ?? "0.5");

/** Reste a charge (ce que le client paie reellement) apres credit d'impot. */
export function resteACharge(total: number): number {
  return Math.round(total * (1 - CREDIT_RATE));
}

/** Montant pris en charge par le credit d'impot. */
export function creditImpot(total: number): number {
  return total - resteACharge(total);
}

/** Formatte un montant entier en euros, ex: 25 -> "25 €". */
export function euros(amount: number): string {
  return `${amount} €`;
}

/** Detail tarifaire d'une prestation, pret a afficher. */
export function priceBreakdown(hourlyRate: number, hours = 1) {
  const total = hourlyRate * hours;
  return {
    total,
    reste: resteACharge(total),
    credit: creditImpot(total),
  };
}
