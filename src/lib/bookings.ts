// Acces aux reservations, avec le professeur associe.
import { prisma, parseList } from "@/lib/db";

export type BookingWithTeacher = {
  id: string;
  studentName: string;
  studentEmail: string;
  slotStart: Date;
  slotEnd: Date;
  mode: string;
  status: string; // pending | paid | cancelled
  amount: number;
  restACharge: number;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    subjects: string[];
  };
};

export async function getBooking(id: string): Promise<BookingWithTeacher | null> {
  try {
    const b = await prisma.booking.findUnique({
      where: { id },
      include: { teacher: true },
    });
    if (!b) return null;
    return {
      id: b.id,
      studentName: b.studentName,
      studentEmail: b.studentEmail,
      slotStart: b.slotStart,
      slotEnd: b.slotEnd,
      mode: b.mode,
      status: b.status,
      amount: b.amount,
      restACharge: b.restACharge,
      teacher: {
        id: b.teacher.id,
        firstName: b.teacher.firstName,
        lastName: b.teacher.lastName,
        subjects: parseList(b.teacher.subjects),
      },
    };
  } catch (err) {
    console.error("getBooking: base indisponible", err);
    return null;
  }
}
