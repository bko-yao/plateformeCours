# Deploiement

Le scaffold tourne en **SQLite** pour le developpement local (zero installation).
Un hebergement **serverless** (Vercel, Netlify) exige une base **PostgreSQL**
managee. La couche de donnees stocke deja les listes en JSON-string, donc le
**seul changement de code** pour passer en Postgres est le `provider` Prisma.

## Option recommandee : Vercel + Postgres (Neon / Vercel Postgres)

### 1. Basculer Prisma sur PostgreSQL

Dans `prisma/schema.prisma` :

```prisma
datasource db {
  provider = "postgresql"   // au lieu de "sqlite"
  url      = env("DATABASE_URL")
}
```

Aucune autre modification n'est requise : les champs `subjects` / `levels` /
`cities` sont des chaines JSON, valides aussi bien en SQLite qu'en Postgres.
(Optionnel, plus tard : passer ces champs en `String[]` natif Postgres.)

### 2. Provisionner une base Postgres

- **Vercel Postgres** (onglet *Storage* du projet Vercel), ou
- **Neon** (https://neon.tech, offre gratuite) → recuperer la chaine
  `postgresql://...`.

### 3. Importer le repo sur Vercel

1. https://vercel.com/new → *Import Git Repository* → `bko-yao/plateformecours`
   (l'app GitHub de Claude est deja installee, le repo est visible).
2. Framework detecte : **Next.js** (aucune config a changer).
3. **Environment Variables** :
   - `DATABASE_URL` = la chaine Postgres de l'etape 2
   - `NEXT_PUBLIC_SITE_URL` = l'URL de production (ex. `https://preceptio.vercel.app`)
   - `CREDIT_IMPOT_RATE` = `0.5`
4. **Build Command** (pour appliquer le schema au deploiement) :
   ```
   prisma generate && prisma db push && next build
   ```
   (`prisma db push` cree les tables sur la base Postgres au premier build.)
5. Deployer.

### 4. Seed des professeurs de demonstration (une fois)

En local, pointe sur la base de prod puis :

```bash
DATABASE_URL="postgresql://..." npm run db:seed
```

> Le seed est optionnel : sans lui, l'app fonctionne mais l'annuaire de profs
> est vide. En production reelle, les profs sont crees via l'onboarding.

## Alternative : hebergement avec disque persistant (SQLite conserve)

Sur **Railway**, **Fly.io** ou **Render** avec un volume persistant, on peut
garder SQLite : monter un volume sur `/app/prisma` et pointer
`DATABASE_URL="file:/app/prisma/dev.db"`. Simple pour une demo, non recommande
pour la montee en charge (voir `CONCEPTION.md`, section 4 : Postgres en prod).

## Checklist production (au-dela du MVP)

- [ ] PostgreSQL manage + sauvegardes
- [ ] Variables Stripe / URSSAF / Anthropic (voir `.env.example`)
- [ ] Domaine + `NEXT_PUBLIC_SITE_URL`
- [ ] Hebergement des donnees en UE (RGPD, cf. CONCEPTION.md section 9)
- [ ] Monitoring (Sentry) et logs
