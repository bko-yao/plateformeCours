import type { MetadataRoute } from "next";
import { SUBJECTS, LEVELS, CITIES } from "@/lib/catalog";

// Sitemap dynamique couvrant les pages SEO programmatiques.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const routes: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/demande`, priority: 0.9 },
  ];
  for (const s of SUBJECTS)
    for (const l of LEVELS)
      for (const c of CITIES)
        routes.push({
          url: `${base}/cours/${s.slug}/${l.slug}/${c.slug}`,
          priority: 0.6,
        });
  return routes;
}
