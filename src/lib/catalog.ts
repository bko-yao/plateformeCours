// Catalogue de reference : matieres, niveaux, villes.
// Sert a la fois aux pages SEO programmatiques, au formulaire de
// qualification et au seed. Chaque entree a un `slug` (URL) et un `label`.

export type CatalogEntry = { slug: string; label: string };

export const SUBJECTS: CatalogEntry[] = [
  { slug: "mathematiques", label: "Mathematiques" },
  { slug: "physique-chimie", label: "Physique-Chimie" },
  { slug: "francais", label: "Francais" },
  { slug: "anglais", label: "Anglais" },
  { slug: "svt", label: "SVT" },
  { slug: "histoire-geo", label: "Histoire-Geographie" },
];

export const LEVELS: CatalogEntry[] = [
  { slug: "primaire", label: "Primaire" },
  { slug: "college", label: "College" },
  { slug: "lycee", label: "Lycee" },
  { slug: "terminale", label: "Terminale" },
  { slug: "superieur", label: "Superieur" },
];

export const CITIES: CatalogEntry[] = [
  { slug: "paris", label: "Paris" },
  { slug: "lyon", label: "Lyon" },
  { slug: "marseille", label: "Marseille" },
  { slug: "bordeaux", label: "Bordeaux" },
  { slug: "lille", label: "Lille" },
];

export const GOALS: CatalogEntry[] = [
  { slug: "rattrapage", label: "Rattraper un retard" },
  { slug: "excellence", label: "Viser l'excellence" },
  { slug: "examen", label: "Preparer un examen" },
];

export const MODES: CatalogEntry[] = [
  { slug: "presentiel", label: "A domicile" },
  { slug: "visio", label: "En visio" },
  { slug: "both", label: "Peu importe" },
];

export function labelFor(list: CatalogEntry[], slug: string): string {
  return list.find((e) => e.slug === slug)?.label ?? slug;
}

export function isValidSlug(list: CatalogEntry[], slug: string): boolean {
  return list.some((e) => e.slug === slug);
}
