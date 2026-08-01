/**
 * Central URL helper. Every internal link goes through one of these — never
 * concatenate route strings inline, otherwise a route rename means grepping
 * the whole codebase.
 */

export const ROUTES = {
  home: "/",
  news: "/news",
  teams: "/mannschaften",
  schedule: "/spieluebersicht",
  sponsors: "/sponsoren",
  search: "/suche",
} as const;

export function newsPath(slug: string): string {
  return `${ROUTES.news}/${slug}`;
}

export function teamPath(slug: string): string {
  return `${ROUTES.teams}/${slug}`;
}

export function pagePath(slug: string): string {
  return slug === "home" ? ROUTES.home : `/${slug}`;
}

/** Public handball.net URL of a team's fixture list or league table. */
export function handballNetTeamUrl(
  teamId: string,
  view: "spielplan" | "tabelle" = "tabelle",
): string {
  return `https://www.handball.net/mannschaften/${teamId}/${view}`;
}

/** Absolute URL for canonicals, Open Graph tags and the sitemap. */
export function absoluteUrl(path: string, base: string): string {
  return new URL(path, base).toString();
}
