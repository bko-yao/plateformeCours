-- Seed des professeurs de demonstration (equivalent SQL de prisma/seed.ts).
-- A coller dans Neon -> SQL Editor (https://console.neon.tech) puis executer.
-- Idempotent : vide les tables concernees avant de reinserer.

BEGIN;

DELETE FROM "Booking";
DELETE FROM "Availability";
DELETE FROM "Teacher";

INSERT INTO "Teacher"
  ("id","firstName","lastName","bio","subjects","levels","cities","mode","hourlyRate","rating","reviewsCount","verified","photoUrl","createdAt")
VALUES
  ('t1','Camille','Durand','Agregee de mathematiques, 8 ans d''experience en preparation au bac. Pedagogie bienveillante et methodique.',
   '["mathematiques","physique-chimie"]','["lycee","terminale"]','["lyon"]','both',42,4.9,127,true,NULL,now()),
  ('t2','Karim','Benali','Ingenieur et professeur de maths/physique. Specialiste du rattrapage et de la reprise de confiance.',
   '["mathematiques","physique-chimie","svt"]','["college","lycee"]','["lyon","paris"]','visio',35,4.7,89,true,NULL,now()),
  ('t3','Sophie','Martin','Professeure certifiee de francais, correctrice au bac. Methodologie de la dissertation et du commentaire.',
   '["francais","histoire-geo"]','["college","lycee","terminale"]','["paris"]','both',38,4.8,64,true,NULL,now()),
  ('t4','James','Cooper','Bilingue anglais, formateur TOEIC/Cambridge. Cours vivants axes sur l''oral et la confiance.',
   '["anglais"]','["college","lycee","superieur"]','["paris","lyon","bordeaux"]','visio',40,4.9,152,true,NULL,now()),
  ('t5','Lea','Roux','Etudiante en ecole d''ingenieur, cours de maths et physique pour college et lycee. Tarifs accessibles.',
   '["mathematiques","physique-chimie"]','["primaire","college","lycee"]','["marseille","lyon"]','presentiel',24,4.5,31,false,NULL,now()),
  ('t6','Nathalie','Petit','Professeure des ecoles, accompagnement primaire toutes matieres et aide aux devoirs.',
   '["mathematiques","francais"]','["primaire","college"]','["lille","paris"]','both',28,4.6,47,true,NULL,now());

-- Disponibilites : lundi & mercredi 17h-20h, samedi 9h-13h (minutes depuis minuit)
INSERT INTO "Availability" ("id","teacherId","weekday","startMin","endMin")
SELECT t."id" || '-' || d.wd, t."id", d.wd, d.s, d.e
FROM "Teacher" t
CROSS JOIN (VALUES (1,1020,1200),(3,1020,1200),(6,540,780)) AS d(wd,s,e);

COMMIT;

-- Verification :
-- SELECT count(*) FROM "Teacher";       -- attendu : 6
-- SELECT count(*) FROM "Availability";  -- attendu : 18
