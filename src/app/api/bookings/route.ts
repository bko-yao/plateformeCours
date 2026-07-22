import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getTeacher } from "@/lib/teachers";
import { resteACharge } from "@/lib/pricing";

// Creation d'une reservation. Le paiement (Stripe) et l'Avance Immediate
// URSSAF sont des stubs pour le MVP : on cree la reservation en statut
// "pending" et on calcule le reste a charge (credit d'impot 50%).
// (Voir CONCEPTION.md, section 3.5.)

const schema = z.object({
  teacherId: z.string().min(1),
  studentName: z.string().min(1),
  studentEmail: z.string().email(),
  slotStart: z.string().datetime(),
  durationMin: z.number().int().min(30).max(240).default(60),
  mode: z.enum(["presentiel", "visio"]),
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

  const teacher = await getTeacher(d.teacherId);
  if (!teacher) {
    return NextResponse.json({ error: "Professeur introuvable" }, { status: 404 });
  }

  const start = new Date(d.slotStart);
  const end = new Date(start.getTime() + d.durationMin * 60_000);
  const amount = Math.round((teacher.hourlyRate * d.durationMin) / 60);
  const reste = resteACharge(amount);

  let booking;
  try {
    booking = await prisma.booking.create({
      data: {
        teacherId: teacher.id,
        studentName: d.studentName,
        studentEmail: d.studentEmail,
        slotStart: start,
        slotEnd: end,
        mode: d.mode,
        status: "pending", // -> "paid" apres paiement Stripe
        amount,
        restACharge: reste,
      },
    });
  } catch (err) {
    const code = (err as { code?: string })?.code;
    console.error("bookings: echec ecriture base", code, err);
    const message =
      code === "P2021"
        ? "La base de donnees n'est pas initialisee (tables manquantes)."
        : code === "P1001"
          ? "Base de donnees injoignable. Verifiez DATABASE_URL."
          : "Reservation impossible cote serveur.";
    return NextResponse.json({ error: message, code: code ?? null }, { status: 503 });
  }

  // TODO(phase 2): creer une session de paiement Stripe Connect,
  // declarer la prestation a l'URSSAF (Avance Immediate), generer la facture.

  return NextResponse.json({
    bookingId: booking.id,
    amount,
    restACharge: reste,
    paymentStatus: "stub", // aucun paiement reel en MVP
  });
}
