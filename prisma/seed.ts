// Seed de donnees de demonstration : professeurs + disponibilites.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const L = (v: string[]) => JSON.stringify(v);

const TEACHERS = [
  {
    firstName: "Camille",
    lastName: "Durand",
    bio: "Agregee de mathematiques, 8 ans d'experience en preparation au bac. Pedagogie bienveillante et methodique.",
    subjects: L(["mathematiques", "physique-chimie"]),
    levels: L(["lycee", "terminale"]),
    cities: L(["lyon"]),
    mode: "both",
    hourlyRate: 42,
    rating: 4.9,
    reviewsCount: 127,
    verified: true,
  },
  {
    firstName: "Karim",
    lastName: "Benali",
    bio: "Ingenieur et professeur de maths/physique. Specialiste du rattrapage et de la reprise de confiance.",
    subjects: L(["mathematiques", "physique-chimie", "svt"]),
    levels: L(["college", "lycee"]),
    cities: L(["lyon", "paris"]),
    mode: "visio",
    hourlyRate: 35,
    rating: 4.7,
    reviewsCount: 89,
    verified: true,
  },
  {
    firstName: "Sophie",
    lastName: "Martin",
    bio: "Professeure certifiee de francais, correctrice au bac. Methodologie de la dissertation et du commentaire.",
    subjects: L(["francais", "histoire-geo"]),
    levels: L(["college", "lycee", "terminale"]),
    cities: L(["paris"]),
    mode: "both",
    hourlyRate: 38,
    rating: 4.8,
    reviewsCount: 64,
    verified: true,
  },
  {
    firstName: "James",
    lastName: "Cooper",
    bio: "Bilingue anglais, formateur TOEIC/Cambridge. Cours vivants axes sur l'oral et la confiance.",
    subjects: L(["anglais"]),
    levels: L(["college", "lycee", "superieur"]),
    cities: L(["paris", "lyon", "bordeaux"]),
    mode: "visio",
    hourlyRate: 40,
    rating: 4.9,
    reviewsCount: 152,
    verified: true,
  },
  {
    firstName: "Lea",
    lastName: "Roux",
    bio: "Etudiante en ecole d'ingenieur, cours de maths et physique pour college et lycee. Tarifs accessibles.",
    subjects: L(["mathematiques", "physique-chimie"]),
    levels: L(["primaire", "college", "lycee"]),
    cities: L(["marseille", "lyon"]),
    mode: "presentiel",
    hourlyRate: 24,
    rating: 4.5,
    reviewsCount: 31,
    verified: false,
  },
  {
    firstName: "Nathalie",
    lastName: "Petit",
    bio: "Professeure des ecoles, accompagnement primaire toutes matieres et aide aux devoirs.",
    subjects: L(["mathematiques", "francais"]),
    levels: L(["primaire", "college"]),
    cities: L(["lille", "paris"]),
    mode: "both",
    hourlyRate: 28,
    rating: 4.6,
    reviewsCount: 47,
    verified: true,
  },
];

async function main() {
  console.log("Seeding...");
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.teacher.deleteMany();

  for (const t of TEACHERS) {
    const teacher = await prisma.teacher.create({ data: t });
    // Disponibilites : lun/mer/sam en fin de journee, exemple.
    await prisma.availability.createMany({
      data: [
        { teacherId: teacher.id, weekday: 1, startMin: 17 * 60, endMin: 20 * 60 },
        { teacherId: teacher.id, weekday: 3, startMin: 17 * 60, endMin: 20 * 60 },
        { teacherId: teacher.id, weekday: 6, startMin: 9 * 60, endMin: 13 * 60 },
      ],
    });
  }
  console.log(`Seeded ${TEACHERS.length} teachers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
