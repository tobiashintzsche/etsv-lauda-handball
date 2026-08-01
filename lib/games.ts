import { unstable_cache } from "next/cache";

import type { Where } from "payload";

import type { Game } from "@payload-types";

import { getPayloadClient } from "./payload";

/**
 * Fixtures expire simply by the clock passing — no Payload write fires to
 * purge the tag. Hence a much shorter TTL than the other loaders use.
 */
const GAMES_TTL_SECONDS = 15 * 60;

export type NextGamesOptions = {
  teamId?: string | number;
  /** Maximum games per column (home / away). Default 3. */
  maxPerColumn?: number;
};

export type NextGames = {
  home: Game[];
  away: Game[];
};

async function fetchNextGames(options: NextGamesOptions): Promise<NextGames> {
  const { teamId, maxPerColumn = 3 } = options;
  const payload = await getPayloadClient();

  const byVenue = async (homeAway: "home" | "away") => {
    const and: Where[] = [
      { homeAway: { equals: homeAway } },
      { date: { greater_than_equal: new Date().toISOString() } },
    ];
    if (teamId) and.push({ team: { equals: teamId } });

    const result = await payload.find({
      collection: "games",
      where: { and },
      sort: "date",
      limit: maxPerColumn,
      depth: 1,
    });
    return result.docs;
  };

  const [home, away] = await Promise.all([byVenue("home"), byVenue("away")]);
  return { home, away };
}

/** Upcoming fixtures split into home and away columns. */
export async function getNextGames(options: NextGamesOptions = {}): Promise<NextGames> {
  const key = JSON.stringify(options);
  const cached = unstable_cache(fetchNextGames, ["next-games", key], {
    tags: ["games"],
    revalidate: GAMES_TTL_SECONDS,
  });
  return cached(options);
}

async function fetchRecentGames(teamId: string | number | undefined, limit: number) {
  const payload = await getPayloadClient();
  const and: Where[] = [{ date: { less_than: new Date().toISOString() } }];
  if (teamId) and.push({ team: { equals: teamId } });

  const result = await payload.find({
    collection: "games",
    where: { and },
    sort: "-date",
    limit,
    depth: 1,
  });
  return result.docs;
}

/** Most recently played games — for the matchday bar and result strips. */
export async function getRecentGames(teamId?: string | number, limit = 3): Promise<Game[]> {
  const cached = unstable_cache(
    fetchRecentGames,
    ["recent-games", String(teamId ?? "all"), String(limit)],
    { tags: ["games"], revalidate: GAMES_TTL_SECONDS },
  );
  return cached(teamId, limit);
}
