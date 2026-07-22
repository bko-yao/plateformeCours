// Scoring commercial des leads (heuristique v1).
//
// A partir du besoin qualifie, on calcule deux scores 0-100 :
//  - urgency : a quel point le besoin est urgent (echeance proche, examen)
//  - value   : valeur commerciale estimee (volume d'heures, budget)
// Ils alimentent la priorisation des leads dans le back-office admin.
// En phase 2 : modele ML entraine sur l'historique de conversion.

export type ScoringInput = {
  goal: string; // "rattrapage" | "excellence" | "examen"
  deadline?: string | null;
  budgetMax?: number | null;
  hoursPerWeek: number;
};

export function urgencyScore(input: ScoringInput): number {
  let s = 30;
  if (input.goal === "examen") s += 40;
  else if (input.goal === "rattrapage") s += 25;

  if (input.deadline) {
    const days = daysUntil(input.deadline);
    if (days !== null) {
      if (days <= 14) s += 30;
      else if (days <= 45) s += 15;
    }
  }
  return clamp(s);
}

export function valueScore(input: ScoringInput): number {
  let s = 20;
  s += Math.min(40, input.hoursPerWeek * 12); // + le volume est eleve, + de valeur
  if (input.budgetMax != null) {
    if (input.budgetMax >= 40) s += 30;
    else if (input.budgetMax >= 25) s += 20;
    else s += 10;
  } else {
    s += 15; // budget non contraint = plutot bon signe
  }
  return clamp(s);
}

function daysUntil(deadline: string): number | null {
  const t = Date.parse(deadline);
  if (Number.isNaN(t)) return null;
  const ms = t - Date.now();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
