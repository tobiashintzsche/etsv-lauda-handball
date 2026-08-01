import { unstable_cache } from "next/cache";

import type { Player, Team } from "@payload-types";

import { CACHE_TTL_SECONDS, getPayloadClient } from "./payload";

async function fetchTeams(): Promise<Team[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "teams",
    sort: "sortOrder",
    limit: 50,
    depth: 1,
  });
  return result.docs;
}

/** All teams in editor-defined order. Used by the nav, the about block and /spieluebersicht. */
export async function getTeams(): Promise<Team[]> {
  const cached = unstable_cache(fetchTeams, ["teams-all"], {
    tags: ["teams"],
    revalidate: CACHE_TTL_SECONDS,
  });
  return cached();
}

async function fetchTeamBySlug(slug: string): Promise<Team | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "teams",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  });
  return result.docs[0] ?? null;
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  const cached = unstable_cache(fetchTeamBySlug, ["teams-by-slug", slug], {
    tags: ["teams", `teams-${slug}`],
    revalidate: CACHE_TTL_SECONDS,
  });
  return cached(slug);
}

async function fetchTeamSlugs(): Promise<string[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "teams",
    limit: 100,
    depth: 0,
    select: { slug: true },
  });
  return result.docs.map((d) => d.slug).filter(Boolean);
}

/** All team slugs — for generateStaticParams and the sitemap. */
export async function getTeamSlugs(): Promise<string[]> {
  const cached = unstable_cache(fetchTeamSlugs, ["teams-slugs"], {
    tags: ["teams"],
    revalidate: CACHE_TTL_SECONDS,
  });
  return cached();
}

async function fetchPlayersByTeam(teamId: string | number): Promise<Player[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "players",
    where: { team: { equals: teamId } },
    sort: "sortOrder",
    limit: 60,
    depth: 1,
  });
  return result.docs;
}

/** Squad of one team, in editor-defined order. */
export async function getPlayersByTeam(teamId: string | number): Promise<Player[]> {
  const cached = unstable_cache(fetchPlayersByTeam, ["players-by-team", String(teamId)], {
    tags: ["players", "teams"],
    revalidate: CACHE_TTL_SECONDS,
  });
  return cached(teamId);
}
