# Preceptio — MVP plateforme de cours particuliers

Application Next.js (App Router) implementant le socle MVP decrit dans
[`CONCEPTION.md`](./CONCEPTION.md) : decouverte SEO, qualification du besoin,
matching par regles, reservation et back-office admin, avec le calcul du
**reste a charge apres credit d'impot 50 %** au centre de l'experience.

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **Prisma** ORM — SQLite en dev (zero installation), PostgreSQL en prod
- **Zod** pour la validation des entrees API

## Demarrage

```bash
npm install
cp .env.example .env
npm run db:push     # cree le schema SQLite (prisma/dev.db)
npm run db:seed     # insere des professeurs de demonstration
npm run dev         # http://localhost:3000
```

## Parcours a tester

| Etape du cycle client | URL |
|---|---|
| Decouverte (accueil) | `/` |
| Decouverte SEO (matiere x niveau x ville) | `/cours/mathematiques/terminale/lyon` |
| Qualification + matching (tunnel 3 etapes) | `/demande` |
| Reservation + reste a charge | `/reserver/<id>` (via un resultat de matching) |
| Back-office admin | `/admin` |

## Ce qui est reel vs. stub (MVP)

| Fonctionnalite | Etat |
|---|---|
| Pages SEO programmatiques + sitemap + JSON-LD | reel |
| Qualification -> lead + profil de besoin | reel (persiste en base) |
| Scoring commercial (urgence / valeur) | reel (heuristique) |
| Matching par regles (top 3 explique) | reel |
| Reservation + calcul credit d'impot | reel |
| Paiement Stripe / Avance Immediate URSSAF | **stub** (phase 2) |
| Chatbot IA / qualification adaptative LLM | **stub** (phase 2) |
| Facturation PDF / Factur-X | **stub** (phase 2) |

## Structure

```
src/
  app/
    page.tsx                              # accueil (decouverte)
    cours/[subject]/[level]/[city]/       # pages SEO programmatiques
    demande/                              # tunnel de qualification (client)
    reserver/[teacherId]/                 # reservation
    admin/                               # back-office
    api/qualification/ · api/bookings/    # routes API
    sitemap.ts
  lib/
    catalog.ts   # matieres / niveaux / villes
    matching.ts  # moteur de matching (regles ponderees)
    scoring.ts   # scoring commercial des leads
    pricing.ts   # calcul du reste a charge (credit d'impot)
    teachers.ts  # acces donnees professeurs
    db.ts        # client Prisma
  components/     # Header, TeacherCard, BookingForm
prisma/
  schema.prisma  # modele de donnees
  seed.ts        # professeurs de demonstration
```

## Passage en production (Postgres)

Dans `prisma/schema.prisma`, remplacer `provider = "sqlite"` par
`postgresql`, convertir les champs listes (`subjects`, `levels`, `cities`)
en `String[]`, et pointer `DATABASE_URL` vers l'instance Postgres.
