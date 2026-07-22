import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAllTeachers } from "@/lib/teachers";
import { rankTeachers } from "@/lib/matching";
import { urgencyScore, valueScore } from "@/lib/scoring";
import {
  SUBJECTS,
  LEVELS,
  CITIES,
  GOALS,
  MODES,
  isValidSlug,
  type CatalogEntry,
} from "@/lib/catalog";

// Qualification du besoin : cree un lead + un profil de besoin structure,
// calcule les scores commerciaux, puis renvoie le top 3 des profs matches.
// (Voir CONCEPTION.md, sections 3.2 / 3.3 / 3.4.)

const slug = (list: CatalogEntry[]) =>
  z.string().refine((v) => isValidSlug(list, v), "valeur invalide");

const schema = z.object({
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  subject: slug(SUBJECTS),
  level: slug(LEVELS),
  city: slug(CITIES),
  goal: slug(GOALS),
  mode: slug(MODES),
  deadline: z.string().optional(),
  budgetMax: z.number().int().positive().optional(),
  hoursPerWeek: z.number().int().min(1).max(20).default(1),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Donnees invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const d = parsed.data;

  const scoreInput = {
    goal: d.goal,
    deadline: d.deadline,
    budgetMax: d.budgetMax,
    hoursPerWeek: d.hoursPerWeek,
  };
  const urgency = urgencyScore(scoreInput);
  const value = valueScore(scoreInput);

  let lead;
  try {
    lead = await prisma.lead.create({
      data: {
        contactName: d.contactName,
        contactEmail: d.contactEmail,
        contactPhone: d.contactPhone,
        status: "qualified",
        urgencyScore: urgency,
        valueScore: value,
        needProfile: {
          create: {
            subject: d.subject,
            level: d.level,
            city: d.city,
            goal: d.goal,
            mode: d.mode,
            deadline: d.deadline,
            budgetMax: d.budgetMax,
            hoursPerWeek: d.hoursPerWeek,
            notes: d.notes,
          },
        },
      },
    });
  } catch (err) {
    const code = (err as { code?: string })?.code;
    console.error("qualification: echec ecriture base", code, err);
    // P2021 = table absente, P1001 = base injoignable.
    const message =
      code === "P2021"
        ? "La base de donnees n'est pas initialisee (tables manquantes). Executez la migration / le db push."
        : code === "P1001"
          ? "Base de donnees injoignable. Verifiez DATABASE_URL."
          : "Enregistrement impossible cote serveur.";
    return NextResponse.json({ error: message, code: code ?? null }, { status: 503 });
  }

  const teachers = await getAllTeachers();
  const matches = rankTeachers(
    { subject: d.subject, level: d.level, city: d.city, mode: d.mode, budgetMax: d.budgetMax },
    teachers,
    3,
  );

  return NextResponse.json({
    leadId: lead.id,
    scores: { urgency, value },
    matches: matches.map((m) => ({
      teacherId: m.teacher.id,
      score: m.score,
      reasons: m.reasons,
      firstName: m.teacher.firstName,
      lastName: m.teacher.lastName,
      rating: m.teacher.rating,
      hourlyRate: m.teacher.hourlyRate,
      verified: m.teacher.verified,
    })),
  });
}
