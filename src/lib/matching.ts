// Moteur de matching v1 (regles ponderees).
//
// Croise un besoin (NeedProfile) avec les professeurs disponibles et
// produit un score de compatibilite 0-100 explique. En phase 2, ce
// scoring par regles est complete/remplace par un re-ranking ML entraine
// sur l'historique de conversion (voir CONCEPTION.md, sections 3.4 / 6).

export type TeacherLike = {
  id: string;
  firstName: string;
  lastName: string;
  subjects: string[];
  levels: string[];
  cities: string[];
  mode: string; // "presentiel" | "visio" | "both"
  hourlyRate: number;
  rating: number;
  verified: boolean;
};

export type NeedLike = {
  subject: string;
  level: string;
  city: string;
  mode: string; // "presentiel" | "visio" | "both"
  budgetMax?: number | null;
};

export type MatchResult = {
  teacher: TeacherLike;
  score: number; // 0-100
  reasons: string[];
};

const WEIGHTS = {
  subject: 40, // eliminatoire de fait : la matiere doit correspondre
  level: 20,
  geo: 20,
  budget: 10,
  rating: 10,
};

function modeCompatible(need: string, teacher: string): boolean {
  if (need === "both" || teacher === "both") return true;
  return need === teacher;
}

export function scoreTeacher(need: NeedLike, teacher: TeacherLike): MatchResult {
  let score = 0;
  const reasons: string[] = [];

  // Matiere (obligatoire pour etre pertinent)
  if (teacher.subjects.includes(need.subject)) {
    score += WEIGHTS.subject;
    reasons.push("Specialiste de la matiere demandee");
  }

  // Niveau
  if (teacher.levels.includes(need.level)) {
    score += WEIGHTS.level;
    reasons.push("Enseigne au niveau demande");
  }

  // Geo / mode
  const geoOk =
    modeCompatible(need.mode, teacher.mode) &&
    (need.mode === "visio" ||
      teacher.mode === "visio" ||
      teacher.cities.includes(need.city));
  if (geoOk) {
    score += WEIGHTS.geo;
    reasons.push(
      need.mode === "visio" ? "Disponible en visio" : "Intervient dans votre ville",
    );
  }

  // Budget
  if (need.budgetMax == null || teacher.hourlyRate <= need.budgetMax) {
    score += WEIGHTS.budget;
    if (need.budgetMax != null) reasons.push("Dans votre budget");
  }

  // Qualite (note ramenee sur 10 points)
  const ratingPoints = Math.round((teacher.rating / 5) * WEIGHTS.rating);
  score += ratingPoints;
  if (teacher.rating >= 4.5) reasons.push(`Excellente note (${teacher.rating.toFixed(1)}/5)`);
  if (teacher.verified) reasons.push("Profil verifie");

  return { teacher, score: Math.min(100, score), reasons };
}

/** Classe les profs par compatibilite et renvoie les `limit` meilleurs pertinents. */
export function rankTeachers(
  need: NeedLike,
  teachers: TeacherLike[],
  limit = 3,
): MatchResult[] {
  return teachers
    .map((t) => scoreTeacher(need, t))
    // On ne propose que des profs de la bonne matiere (score minimal credible).
    .filter((r) => r.teacher.subjects.includes(need.subject))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
