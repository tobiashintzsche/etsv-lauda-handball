import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/env";

/**
 * Admin, API und die Vorschau-Routen gehoeren nicht in den Index — sie liefern
 * keinen Inhalt fuer Besucher und wuerden nur Crawl-Budget verbrennen.
 *
 * Auf einer Vorschau- oder Testdomain wird die ganze Seite gesperrt: sonst
 * konkurrieren identische Inhalte unter zwei Adressen um dieselben Suchbegriffe.
 */
export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : true;

  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
