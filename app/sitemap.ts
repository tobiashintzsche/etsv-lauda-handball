import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/env";
import { ROUTES, newsPath, teamPath } from "@/lib/paths";
import { type SitemapEntry, getIndexableEntries } from "@/lib/sitemap-entries";

/**
 * Ohne diese Angabe wird die Sitemap einmal beim Build erzeugt und danach
 * unveraendert aus dem CDN ausgeliefert — die Revalidierungs-Hooks von Payload
 * erreichen die Route nicht, weil sie keinen Cache-Tag konsumiert.
 * Eine Stunde Verzug ist fuer eine Sitemap unkritisch, Wochen sind es nicht.
 */
export const revalidate = 3600;

const HOME_SLUG = "home";

/**
 * `lastModified` nur bei einem echten Aenderungsdatum setzen.
 *
 * Ein erfundener Wert ist schlechter als gar keiner: aendert sich lastModified
 * bei jedem Abruf, stuft Google das Signal fuer die ganze Sitemap ab.
 */
function lastModified(value: string | null): { lastModified?: Date } {
  if (!value) return {};
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? {} : { lastModified: date };
}

function entry(path: string, item: SitemapEntry | undefined, priority: number) {
  return {
    url: new URL(path, SITE_URL).toString(),
    priority,
    ...lastModified(item?.updatedAt ?? null),
  };
}

/**
 * Sitemap aus allen veroeffentlichten Seiten, News und Mannschaften plus den
 * fest angelegten Routen.
 *
 * Auf `noindex` gesetzte Dokumente filtert bereits der Loader heraus — sie
 * bleiben erreichbar, tauchen hier aber nicht auf.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, news, teams] = await Promise.all([
    getIndexableEntries("pages"),
    getIndexableEntries("news"),
    getIndexableEntries("teams"),
  ]);

  const home = pages.find((page) => page.slug === HOME_SLUG);

  const staticRoutes: MetadataRoute.Sitemap = [
    entry(ROUTES.home, home, 1),
    // Uebersichtsseiten haben kein eigenes Dokument und damit kein belastbares
    // Aenderungsdatum — lieber gar kein lastModified als ein geratenes.
    { url: new URL(ROUTES.news, SITE_URL).toString(), priority: 0.8 },
    { url: new URL(ROUTES.schedule, SITE_URL).toString(), priority: 0.7 },
    { url: new URL(ROUTES.sponsors, SITE_URL).toString(), priority: 0.5 },
  ];

  const pageRoutes: MetadataRoute.Sitemap = pages
    .filter((page) => page.slug !== HOME_SLUG)
    .map((page) => entry(`/${page.slug}`, page, 0.6));

  const newsRoutes: MetadataRoute.Sitemap = news.map((item) =>
    entry(newsPath(item.slug), item, 0.6),
  );

  const teamRoutes: MetadataRoute.Sitemap = teams.map((team) =>
    entry(teamPath(team.slug), team, 0.7),
  );

  return [...staticRoutes, ...pageRoutes, ...newsRoutes, ...teamRoutes];
}
