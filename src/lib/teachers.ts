// Couche d'acces aux professeurs : lit Prisma et normalise les listes
// JSON-string en tableaux (voir contrainte SQLite dans schema.prisma).
import { prisma, parseList } from "@/lib/db";
import type { TeacherLike } from "@/lib/matching";

export type Teacher = TeacherLike & {
  bio: string;
  reviewsCount: number;
  photoUrl: string | null;
};

function normalize(t: {
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  subjects: string;
  levels: string;
  cities: string;
  mode: string;
  hourlyRate: number;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  photoUrl: string | null;
}): Teacher {
  return {
    id: t.id,
    firstName: t.firstName,
    lastName: t.lastName,
    bio: t.bio,
    subjects: parseList(t.subjects),
    levels: parseList(t.levels),
    cities: parseList(t.cities),
    mode: t.mode,
    hourlyRate: t.hourlyRate,
    rating: t.rating,
    reviewsCount: t.reviewsCount,
    verified: t.verified,
    photoUrl: t.photoUrl,
  };
}

export async function getAllTeachers(): Promise<Teacher[]> {
  const rows = await prisma.teacher.findMany({ orderBy: { rating: "desc" } });
  return rows.map(normalize);
}

export async function getTeacher(id: string): Promise<Teacher | null> {
  const t = await prisma.teacher.findUnique({ where: { id } });
  return t ? normalize(t) : null;
}
