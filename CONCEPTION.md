# Plateforme de cours particuliers — Conception produit & technique

> **Nom de code du projet : `Préceptô`** *(placeholder — voir §11 pour le branding)*
> Plateforme française de **services à la personne** dédiée aux cours particuliers, pensée pour rivaliser avec Acadomia, Complétude et Superprof — avec une expérience plus fluide, plus moderne et fortement automatisée par l'IA.

Document rédigé par l'équipe : **CTO · Product Manager · UX Designer · Expert IA · Développeur Full Stack senior · Marketing digital.**

---

## 1. Vision & positionnement

### Le constat marché
| Acteur | Modèle | Faiblesse exploitable |
|---|---|---|
| **Acadomia / Complétude** | Réseau d'agences, conseiller pédagogique humain, offre premium | Cher, lent (RDV téléphonique, devis manuel), digitalisation faible |
| **Superprof / Kelprof** | Marketplace pure, mise en relation | Aucune garantie qualité, pas de suivi, pas de gestion du crédit d'impôt intégrée, tunnel de paiement fragmenté |

### Notre angle
Un **hybride marketplace + agence augmentée par l'IA** :
- La **qualité et le suivi** d'une agence (matching, pédagogie, reporting).
- La **fluidité et le prix** d'une marketplace (self-service, réservation en ligne, paiement instantané).
- Le **différenciateur décisif français** : intégration native du **crédit d'impôt de 50 %** via l'**Avance Immédiate URSSAF** (le client ne paie que 50 % *tout de suite*, pas un an après). Aucun concurrent digital ne le fait bien aujourd'hui.

### Proposition de valeur (une phrase)
> *« Trouvez le bon professeur en 3 minutes, réservez et payez en ligne, et ne déboursez que la moitié grâce au crédit d'impôt géré automatiquement. »*

### Cibles
- **Parents d'élèves** (primaire → terminale) — cœur de marché, forte valeur, saisonnalité scolaire.
- **Étudiants** (prépa, supérieur, langues, code).
- **Adultes** (langues, reconversion, soft skills).
- **Professeurs** (offre : trouver des élèves + zéro paperasse administrative).

---

## 2. Le cycle de vie client (vue d'ensemble)

```
Découverte ──▶ Renseignement ──▶ Qualification IA ──▶ Matching ──▶ RDV ──▶ Paiement ──▶ Cours ──▶ Facturation ──▶ Suivi/Fidélisation
   (SEO)         (chatbot)        (questionnaire IA)    (algo)     (agenda)  (Stripe+URSSAF) (visio)   (attestation)   (dashboard)
```

Chaque étape ci-dessous est décrite selon trois axes : **① Intérêt · ② Fonctionnement · ③ Développement**.

---

## 3. Fonctionnalités du cycle client

### 3.1 — Découverte du service

**① Intérêt**
Premier point de contact : c'est le canal d'acquisition. En France, la recherche de cours particuliers passe massivement par Google (« prof de maths [ville] », « soutien scolaire terminale »). Un SEO fort = coût d'acquisition (CAC) divisé par 3 vs. la pub payante.

**② Fonctionnement**
- **Pages SEO programmatiques** générées par combinaison *matière × niveau × ville* (ex. `/cours/mathematiques/terminale/lyon`) → plusieurs milliers de landing pages indexables.
- **Contenu enrichi par IA** (descriptions, FAQ, conseils pédagogiques) revu par un humain pour l'E-E-A-T Google.
- **Profils professeurs publics** avec avis vérifiés, tarif, disponibilités — chaque profil est une page d'entrée.
- **Preuve sociale** : notes, taux de réussite, badges (« Agréé », « Vérifié », « Top prof »).

**③ Développement**
- Next.js en **SSG/ISR** (rendu statique incrémental) pour la performance SEO + Core Web Vitals.
- Génération des pages programmatiques via un script de build lisant la base `subjects × levels × cities`.
- `sitemap.xml` dynamique, données structurées **Schema.org** (`Course`, `Person`, `AggregateRating`).
- Balises Open Graph pour le partage social.
- Suivi analytics (Plausible/GA4) + Search Console.

---

### 3.2 — Demande de renseignements

**① Intérêt**
Convertir un visiteur en lead sans friction. Le formulaire classique « on vous rappelle sous 48 h » tue la conversion. On veut une **réponse immédiate, 24/7**.

**② Fonctionnement**
- **Assistant conversationnel IA** (chatbot) en bas à droite + point d'entrée principal du tunnel.
- Il répond aux questions (prix, crédit d'impôt, fonctionnement) et **collecte le besoin** de façon naturelle.
- Capture progressive du lead : email/téléphone demandés seulement une fois de la valeur apportée.
- **Multicanal** : web, mais aussi **WhatsApp Business** et rappel automatique.

**③ Développement**
- LLM (Claude via l'API Anthropic) avec **RAG** sur la base de connaissance (offres, tarifs, FAQ, cadre légal SAP).
- *System prompt* strict : périmètre limité, ton défini, garde-fous anti-hallucination sur les sujets légaux/fiscaux.
- **Function calling** : le bot déclenche des actions (créer un lead, proposer des créneaux, lancer la qualification).
- Persistance des conversations (table `conversations`) pour l'entraînement et le SAV.
- Widget React embarquable + connecteur WhatsApp Cloud API.

---

### 3.3 — Qualification automatique du besoin (cœur IA)

**① Intérêt**
C'est **LE** différenciateur. Chez Acadomia, un conseiller humain qualifie le besoin par téléphone (coûteux, lent, biaisé). Nous le faisons en **2 minutes, gratuitement, à grande échelle**. Une bonne qualification = meilleur matching = meilleure rétention.

**② Fonctionnement**
- **Questionnaire adaptatif** (l'IA choisit la question suivante selon les réponses) : matière, niveau, objectif (rattrapage / excellence / examen), échéance, budget, préférences (présentiel/visio, genre du prof, pédagogie), profil de l'élève (difficultés, motivation).
- L'IA produit un **profil de besoin structuré** + un **score d'urgence** et un **score de valeur** (scoring commercial).
- Génère une **recommandation** : nombre d'heures conseillé, format, 3 professeurs proposés.
- Alimente directement le **matching** (§3.4) et le **dashboard admin** (priorisation des leads chauds).

**③ Développement**
- **Sortie structurée** (structured output / JSON Schema) du LLM → objet `needs_profile` validé et typé.
- Moteur de questions : arbre hybride (règles métier + génération LLM) ; l'IA reformule et adapte, les règles garantissent qu'on collecte les champs obligatoires.
- **Scoring** : d'abord heuristique (règles pondérées), puis modèle ML entraîné sur l'historique de conversion (phase 2).
- Stockage : table `need_profiles` liée au `lead`. Traçabilité RGPD (finalité, durée de conservation).
- Tests : jeux de cas de qualification pour éviter les dérives du modèle (évaluation régulière type « eval »).

---

### 3.4 — Matching & prise de rendez-vous

**① Intérêt**
Le bon prof, au bon créneau, tout de suite. Réduire le délai « besoin → premier cours » de plusieurs jours (agences) à **quelques minutes**.

**② Fonctionnement**
- **Algorithme de matching** : croise le `need_profile` avec les profs disponibles (matière, niveau, zone géo / visio, tarif, disponibilités, note, taux de réanchat, affinité pédagogique).
- Affiche un **top 3** avec score de compatibilité expliqué (« +95 % : spécialiste bac maths, disponible mercredi 17 h, note 4,9 »).
- **Agenda temps réel** : le client voit les créneaux libres et réserve en un clic (comme Doctolib/Calendly).
- **Confirmations et rappels automatiques** (email + SMS) → réduit le no-show.
- Gestion présentiel **et** visio (lien de visioconférence généré automatiquement).

**③ Développement**
- Service de matching : scoring pondéré (v1 règles), exposé via API ; évolution vers un ré-ordonnancement ML.
- **Moteur de disponibilités** : modèle `availability` (créneaux récurrents + exceptions), gestion **fuseaux horaires** et **anti-double-réservation** (verrou transactionnel/optimiste).
- Intégration **calendriers externes** (Google Calendar / Outlook via CalDAV/OAuth) pour synchro bidirectionnelle des profs.
- Notifications : file d'attente + provider email (Postmark/Brevo) et SMS (Twilio/OVH).
- Visio : intégration **Jitsi** (self-host, RGPD-friendly) ou Whereby/Daily embarqué.

---

### 3.5 — Paiement sécurisé (+ crédit d'impôt)

**① Intérêt**
C'est là qu'on gagne l'argent **et** qu'on écrase la concurrence. La gestion intégrée du **crédit d'impôt SAP (50 %)** via l'**Avance Immédiate URSSAF** change tout : le client paie **la moitié**, immédiatement, sans avance de trésorerie ni attente de l'attestation fiscale de N+1.

**② Fonctionnement**
- **Paiement en ligne** sécurisé (CB, prélèvement SEPA, wallet) — à l'acte, par pack d'heures, ou en abonnement mensuel.
- **Enregistrement des mandats** SEPA pour la récurrence.
- **Avance Immédiate** : la plateforme (organisme SAP déclaré) transmet la prestation à l'URSSAF, qui déduit et verse directement les 50 % → le client n'est débité que du reste à charge.
- **Rémunération des professeurs** : reversement automatique (marketplace) après le cours, avec commission plateforme retenue.
- Gestion des **litiges, remboursements, avoirs**.

**③ Développement**
- **Stripe Connect** (comptes connectés pour les profs, *split payments*, retenue de commission, virements automatisés) — ou Mangopay/Lemonway, spécialistes marketplace FR/EU avec cantonnement des fonds (conformité DSP2).
- **3-D Secure** obligatoire (SCA), tokenisation, aucune donnée carte stockée chez nous → **PCI-DSS** délégué au PSP.
- Intégration **API Avance Immédiate / Tiers de prestation URSSAF** : déclaration des prestations, gestion des consentements, réconciliation des versements.
- Webhooks Stripe/URSSAF → mise à jour des statuts de paiement (idempotence, file de retry).
- Prérequis réglementaire : **déclaration/agrément Services à la Personne (SAP)** + conformité NOVA. *(Bloquant produit — à lancer dès le J1, voir roadmap.)*

---

### 3.6 — Facturation

**① Intérêt**
Zéro paperasse pour le client, conformité totale pour l'entreprise. En SAP, l'**attestation fiscale annuelle** (Cerfa) est indispensable au crédit d'impôt — la produire automatiquement est un service à forte valeur perçue.

**② Fonctionnement**
- **Facture automatique** générée après chaque cours/pack, envoyée par email + accessible dans l'espace client.
- **Attestation fiscale annuelle** (montants ouvrant droit au crédit d'impôt) générée en janvier pour tous les clients.
- **Comptabilité professeurs** : relevés de gains, justificatifs.
- Conformité à la **réforme de la facturation électronique** (généralisation 2026–2027 : format structuré Factur-X, plateformes agréées).

**③ Développement**
- Génération PDF serveur (gabarits HTML → PDF) avec numérotation légale séquentielle et mentions obligatoires.
- Modèle de données `invoices` / `credit_notes` immuables (une facture émise ne se modifie pas → avoir).
- **Factur-X** (PDF/A-3 + XML embarqué) pour la conformité e-invoicing à venir ; connexion à une **Plateforme de Dématérialisation Partenaire (PDP)**.
- Job planifié (cron) pour les attestations annuelles + calcul des montants éligibles.
- Archivage légal (durée de conservation 10 ans, stockage sécurisé/chiffré).

---

### 3.7 — Tableau de bord administratif

**① Intérêt**
Le poste de pilotage. Sans back-office solide, on ne scale pas : gestion des profs, modération, suivi des leads, finances, qualité. C'est aussi là que l'IA fait gagner du temps opérationnel (priorisation, détection d'anomalies).

**② Fonctionnement**
- **Vue leads** : pipeline commercial, leads chauds priorisés par le scoring IA, relances automatiques.
- **Gestion professeurs** : onboarding, vérification des diplômes/identité, contrats, activité, qualité.
- **Suivi financier** : CA, commissions, reversements, avance immédiate, impayés.
- **Qualité & modération** : avis, signalements, cours à risque, NPS.
- **Analytics** : acquisition, conversion par étape du tunnel, LTV/CAC, cohortes, saisonnalité.
- **Espaces différenciés** : admin, professeur, client (3 rôles distincts).

**③ Développement**
- Application back-office (React + design system interne) sur des **API sécurisées par rôles (RBAC)**.
- **Multi-tenant par rôles** : admin / prof / client, permissions granulaires, journal d'audit.
- KPIs matérialisés (vues SQL agrégées / entrepôt léger) pour des dashboards rapides.
- **Alertes IA** : détection d'anomalies (churn imminent, prof sous-performant, pic de demande).
- Export comptable (CSV/API) vers l'outil de compta.

---

## 4. Architecture technique cible (CTO)

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENTS : Web (Next.js) · PWA mobile · WhatsApp · Widget    │
└───────────────┬─────────────────────────────────────────────┘
                │ HTTPS / REST + tRPC / WebSocket
┌───────────────▼─────────────────────────────────────────────┐
│  API GATEWAY / BFF (Node.js — NestJS)                        │
│  Auth (JWT/OAuth) · RBAC · Rate limiting · Validation        │
└──┬──────────┬──────────┬──────────┬──────────┬───────────────┘
   │          │          │          │          │
┌──▼───┐ ┌───▼────┐ ┌───▼─────┐ ┌──▼─────┐ ┌──▼──────────┐
│ Core │ │Matching│ │ IA/RAG  │ │Payments│ │ Notifications│
│ CRUD │ │ engine │ │ service │ │ +URSSAF│ │ email/SMS    │
└──┬───┘ └───┬────┘ └───┬─────┘ └──┬─────┘ └──┬──────────┘
   │         │          │          │          │
┌──▼─────────▼──────────▼──────────▼──────────▼──────────────┐
│  DONNÉES : PostgreSQL (principal) · Redis (cache/queues)   │
│  · Vector DB (pgvector) pour le RAG · S3 (docs/factures)   │
└─────────────────────────────────────────────────────────────┘

Externes : Stripe Connect · API URSSAF (Avance Immédiate) · LLM (Anthropic)
           · Twilio/Brevo · Google Calendar · Jitsi/Daily · PDP e-invoicing
```

### Stack recommandée
| Couche | Choix | Pourquoi |
|---|---|---|
| **Frontend** | **Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui** | SEO (SSR/ISR), DX, écosystème, un seul langage front/back |
| **Backend** | **Node.js + NestJS** (ou API Routes Next au MVP) | Structuré, modulaire, TS partagé, monte en charge |
| **Base de données** | **PostgreSQL** + Prisma ORM | Relationnel (transactions financières), robuste, `pgvector` pour l'IA |
| **Cache / files** | **Redis** + BullMQ | Sessions, rate limit, jobs asynchrones (mails, webhooks) |
| **IA** | **API Anthropic (Claude)** + RAG sur pgvector | Qualité de raisonnement, structured output, tool use |
| **Paiement** | **Stripe Connect** (+ API URSSAF Avance Immédiate) | Standard marketplace, SCA/PCI délégué |
| **Infra** | **Vercel** (front) + **Railway/Render/Scaleway** (services), ou **AWS/OVH** à l'échelle | Time-to-market puis souveraineté (données FR/EU) |
| **Observabilité** | Sentry + Better Stack/Grafana + logs structurés | Fiabilité paiement = critique |
| **CI/CD** | GitHub Actions + tests + preview deploys | Qualité continue |

**Principes CTO :** commencer **modulaire monolithe** (pas de micro-services prématurés) ; extraire un service seulement quand la charge le justifie (matching, IA). Données **hébergées en UE** (RGPD, souveraineté = argument commercial).

---

## 5. Modèle de données (extrait)

```
users(id, role[admin|teacher|student|parent], email, phone, status, created_at)
teachers(user_id, bio, subjects[], levels[], hourly_rate, rating, verified, siret?)
students(user_id, parent_id?, level, school)
leads(id, source, contact, status, urgency_score, value_score, need_profile_id)
need_profiles(id, subject, level, goal, budget, format, constraints_json)
availabilities(teacher_id, weekday, start, end, recurrence, exceptions_json)
bookings(id, student_id, teacher_id, slot_start, slot_end, mode[presentiel|visio], status)
lessons(id, booking_id, status, report, duration_min)
payments(id, booking_id, amount, credit_immediate_amount, psp_ref, status)
invoices(id, payment_id, number, pdf_url, facturx_xml, issued_at)
tax_attestations(id, student_id, year, eligible_amount, cerfa_url)
reviews(id, lesson_id, rating, comment, verified)
conversations(id, lead_id, channel, messages_json)
```

---

## 6. L'IA en fil rouge (Expert IA)

| Usage | Technique | Impact business |
|---|---|---|
| Chatbot d'accueil | LLM + RAG + tool calling | Conversion 24/7, -70 % coût pré-vente |
| Qualification du besoin | Structured output + arbre adaptatif | Matching précis, leads scorés |
| Matching | Scoring pondéré → re-ranking ML | Meilleure rétention, satisfaction |
| Génération de contenu SEO | LLM supervisé | Acquisition organique à bas coût |
| Résumé de cours / compte-rendu | LLM sur notes du prof | Valeur perçue parent, gain de temps prof |
| Détection churn / anomalies | ML sur signaux d'usage | Rétention proactive |
| Support / FAQ | RAG | Déflection tickets |

**Garde-fous :** sur les sujets **fiscaux et légaux** (crédit d'impôt, contrats), l'IA ne s'appuie que sur des contenus validés (RAG), affiche des sources, et **escalade vers un humain** au moindre doute. Évaluations régulières (jeux de tests) pour prévenir les régressions du modèle.

---

## 7. Expérience utilisateur (UX Designer)

- **Mobile-first / PWA** : la majorité des parents réservent depuis leur téléphone.
- **Tunnel en 3 minutes** : découverte → qualification → top 3 profs → réservation → paiement, sans rupture.
- **Transparence prix** : le reste à charge après crédit d'impôt affiché *partout* (« 25 €/h au lieu de 50 € »).
- **Confiance** : badges vérifiés, avis authentiques, garantie « satisfait ou premier cours offert ».
- **Accessibilité** RGAA/WCAG AA (secteur para-public, image de sérieux).
- **Design system** cohérent (shadcn/ui + tokens), ton rassurant et pédagogique, pas « techy ».
- **États vides et micro-interactions** soignés (un tunnel de vente vit dans les détails).

---

## 8. Marketing digital & acquisition (Growth)

- **SEO programmatique** (§3.1) = moteur d'acquisition principal, faible CAC.
- **SEA** ciblé sur les intentions chaudes (« cours maths bac urgent ») en complément saisonnier (rentrée, avant-bac).
- **Contenu / SEO éditorial** : guides parents (méthodo, orientation Parcoursup), fiches révisions → autorité + backlinks.
- **Programme de parrainage** (parent → parent, viralité forte sur ce marché).
- **Partenariats** : écoles, associations, comités d'entreprise (CSE), plateformes SAP.
- **Rétention / CRM** : emails cycle de vie, relances IA, offre de packs.
- **Argument massue en com'** : *« -50 % immédiat, pas dans un an »* → à mettre au centre de tout.
- **KPIs** : CAC, LTV, taux de conversion par étape, taux de réanchat, NPS, part de l'organique.

---

## 9. Conformité & risques (transversal)

| Domaine | Exigence | Action |
|---|---|---|
| **Services à la Personne** | Déclaration/agrément SAP, NOVA | À lancer **dès J1** (délai administratif) — bloquant crédit d'impôt |
| **Crédit d'impôt / Avance Immédiate** | Convention URSSAF, API tiers de prestation | Intégration technique + juridique |
| **RGPD** | Données mineurs, consentement parental, DPO | Registre traitements, minimisation, hébergement UE |
| **Paiement** | DSP2/SCA, PCI-DSS, cantonnement des fonds | Déléguer au PSP (Stripe/Mangopay) |
| **Facturation électronique** | Réforme 2026–2027, Factur-X, PDP | Anticiper dès la conception du module facturation |
| **Droit du travail** | Statut des profs (indépendants vs. salariés SAP mandataire/prestataire) | Choix de modèle juridique structurant — arbitrage direction |

> ⚠️ **Le statut SAP et l'Avance Immédiate sont le fossé concurrentiel *et* le principal risque de délai.** Le chantier juridico-administratif doit démarrer en parallèle du code, pas après.

---

## 10. Feuille de route de développement — 12 mois

### 🟢 Phase 1 — MVP (Mois 0–4) : « Réserver et payer un cours en ligne »
**Objectif : valider l'acquisition + le tunnel de réservation/paiement sur 1 ville, 3 matières.**

| Mois | Livrables |
|---|---|
| **M0** | Lancement du **dossier SAP/URSSAF** (juridique, en parallèle). Setup technique (repo, CI/CD, DB, auth, design system). |
| **M1** | Pages découverte SEO (statiques), profils profs, onboarding prof manuel. Modèle de données core. |
| **M2** | Tunnel : formulaire de besoin (v1 sans IA adaptative), matching par **règles**, agenda + réservation. |
| **M3** | **Paiement Stripe** (à l'acte + pack), confirmations/rappels email-SMS, espace client & espace prof basiques. |
| **M4** | Facturation PDF automatique, back-office admin minimal (leads, bookings, profs), analytics. **→ Lancement bêta.** |

**Périmètre MVP :** découverte SEO · formulaire de renseignement · matching par règles · RDV en ligne · paiement Stripe · facture PDF · dashboard admin v1.
**Hors MVP :** IA conversationnelle avancée, Avance Immédiate (en cours d'agrément), visio intégrée, appli mobile native.

---

### 🟡 Phase 2 — Moyen terme (Mois 5–8) : « L'automatisation IA + le crédit d'impôt »
**Objectif : différenciation, activation du fossé concurrentiel, montée en gamme.**

| Mois | Livrables |
|---|---|
| **M5** | **Chatbot IA d'accueil** (LLM + RAG) + capture de leads. WhatsApp Business. |
| **M6** | **Qualification IA adaptative** (structured output) + **scoring des leads** dans le back-office. |
| **M7** | **Avance Immédiate URSSAF** (dès agrément obtenu) → paiement -50 % instantané. Attestations fiscales. |
| **M8** | **Visioconférence intégrée** + compte-rendu de cours généré par IA. Matching v2 (re-ranking). Multi-villes. |

**Débloque :** l'argument marketing « -50 % immédiat », la qualification à grande échelle, le suivi pédagogique automatisé.

---

### 🔵 Phase 3 — Premium / Référence marché (Mois 9–12) : « Devenir la référence »
**Objectif : rétention, LTV, barrières à l'entrée, expansion.**

| Mois | Livrables |
|---|---|
| **M9** | **Application mobile PWA/native** (élève + parent + prof). Notifications push. |
| **M10** | **Abonnements & packs premium** : suivi personnalisé, bilan mensuel IA, garantie résultats. Parrainage. |
| **M11** | **Espace de travail élève augmenté par l'IA** : exercices générés, quiz adaptatifs, tuteur IA entre les cours (complément, pas substitut du prof). |
| **M12** | **Analytics avancés & IA prédictive** (churn, demande, pricing dynamique). **Factur-X / e-invoicing**. Partenariats CSE/écoles. Ouverture nationale. |

**Fonctionnalités premium différenciantes :**
- **Tuteur IA 24/7** entre les cours (aide aux devoirs encadrée, révisions personnalisées).
- **Bilan pédagogique mensuel** généré automatiquement pour les parents.
- **Garantie de progression** (mécanique de réassurance forte).
- **Pricing dynamique** selon la demande/saisonnalité.
- **B2B / CSE** : cours financés par les entreprises (canal à forte valeur).

---

## 11. Décisions ouvertes (à trancher avec la direction)

1. **Nom & marque** — `Préceptô` est un placeholder. À valider (disponibilité INPI + nom de domaine + réseaux).
2. **Modèle juridique SAP** : mandataire vs. prestataire (impacte statut des profs, responsabilité, marge).
3. **PSP** : Stripe Connect (rapidité) vs. Mangopay/Lemonway (spécialistes marketplace FR, cantonnement natif).
4. **Profs** : indépendants (marketplace) vs. salariés (agence) vs. hybride — structure toute l'économie du produit.
5. **Périmètre géographique du MVP** : quelle ville pilote ?

---

## 12. Prochaine étape concrète

Si l'on valide cette conception, le **sprint 0** consiste à :
1. Lancer le dossier SAP/URSSAF (juridique).
2. Initialiser le monorepo (Next.js + NestJS + Prisma + Postgres), la CI/CD et le design system.
3. Modéliser la base de données (§5) et l'auth multi-rôles.
4. Livrer la première page SEO + un profil prof + le squelette du tunnel.

> Je peux enchaîner sur **le scaffolding technique du repo** (structure, schéma Prisma, auth, première page) dès que tu me donnes le feu vert sur la stack (§4) et les décisions ouvertes (§11).
