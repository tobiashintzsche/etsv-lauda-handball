import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/env";
import { isSiteIndexable } from "@/lib/seo";

/**
 * Ein Notausschalter, der erst nach dem naechsten Build wirkt, ist keiner: die
 * Route wird pro Abruf gerendert, damit ein Klick in den Vereinsdaten sofort in
 * der robots.txt steht. Teuer ist das nicht — die Vereinsdaten kommen aus dem
 * getaggten Loader-Cache, und robots.txt ruft ohnehin nur ein Crawler ab.
 */
export const dynamic = "force-dynamic";

/**
 * Admin, API und die Vorschau-Routen gehoeren nicht in den Index — sie liefern
 * keinen Inhalt fuer Besucher und wuerden nur Crawl-Budget verbrennen.
 *
 * Komplett gesperrt wird die Seite in zwei Faellen: auf einer Vorschau- oder
 * Testdomain (sonst konkurrieren identische Inhalte unter zwei Adressen um
 * dieselben Suchbegriffe) und wenn die Sichtbarkeit in den Vereinsdaten
 * abgeschaltet ist.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const isProduction = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : true;

  if (!isProduction || !(await isSiteIndexable())) {
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
