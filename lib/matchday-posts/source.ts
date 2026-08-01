import type { Payload } from "payload";

import type { Team } from "@payload-types";

import { getTeamSchedule } from "@/lib/handball/client";
import { isOwnClub } from "@/lib/handball/opponent-logos";

import type { SourceFixture } from "./types";

/**
 * Where the pipeline gets its fixtures — the same cascade the website uses
 * (`lib/handball/schedule.ts`), just for every team at once and windowed.
 *
 *   1. handball.net live schedule of the team — the federation's own data
 *   2. our `games` collection — editor-maintained, works offline and before
 *      the federation publishes anything
 *
 * The tiers are applied PER TEAM, not globally: a team that handball.net
 * already knows about takes tier 1 while the others still fall back, and no
 * fixture is ever collected twice.
 *
 * Unlike the website loaders this reads through `payload` directly instead of
 * `lib/games.ts`: the pipeline also runs from a plain node script, where the
 * `unstable_cache` wrappers have no Next.js request scope to live in.
 */

export type CollectOptions = {
  /** ISO start of the window, inclusive. */
  from: string;
  /** ISO end of the window, inclusive. */
  to: string;
  /** Ask handball.net first. Off for offline runs and deterministic tests. */
  useLive?: boolean;
};

export type CollectResult = {
  fixtures: SourceFixture[];
  /** How many fixtures each tier contributed — printed by the script. */
  tiers: { live: number; collection: number };
};

/** Fixtures of one team from handball.net, already windowed and normalised. */
async function fromLive(team: Team, options: CollectOptions): Promise<SourceFixture[]> {
  const handballTeamId = team.handballNet?.teamId;
  if (!handballTeamId) return [];

  const from = new Date(options.from).getTime();
  const to = new Date(options.to).getTime();
  const games = await getTeamSchedule(handballTeamId);

  return games
    .filter(
      (game) => Number.isFinite(game.startsAt) && game.startsAt >= from && game.startsAt <= to,
    )
    .map((game) => {
      const homeName = game.homeTeam?.name ?? "";
      const isOwnHome = isOwnClub(homeName);
      // The post prints OUR team under its internal name ("Männer"), never the
      // club name handball.net returns ("ETSV Lauda 2").
      return {
        sourceGameId: `hbnet:${game.id}`,
        kickoff: new Date(game.startsAt).toISOString(),
        homeTeam: isOwnHome ? team.name : homeName,
        awayTeam: isOwnHome ? (game.awayTeam?.name ?? "") : team.name,
        isOwnHome,
        venue: game.field?.name ?? null,
        league: game.tournament?.name ?? null,
      } satisfies SourceFixture;
    });
}

/** Fixtures of one team from our own collection. */
async function fromCollection(
  payload: Payload,
  team: Team,
  options: CollectOptions,
): Promise<SourceFixture[]> {
  const result = await payload.find({
    collection: "games",
    where: {
      and: [
        { team: { equals: team.id } },
        { date: { greater_than_equal: options.from } },
        { date: { less_than_equal: options.to } },
      ],
    },
    sort: "date",
    limit: 100,
    depth: 0,
  });

  return result.docs.map((game) => {
    const isOwnHome = game.homeAway === "home";
    return {
      sourceGameId: `game:${game.id}`,
      kickoff: game.date,
      homeTeam: isOwnHome ? team.name : game.opponent,
      awayTeam: isOwnHome ? game.opponent : team.name,
      isOwnHome,
      venue: game.venue ?? null,
      league: team.liga ?? null,
    } satisfies SourceFixture;
  });
}

/** Every fixture of every team inside the window, earliest first. */
export async function collectFixtures(
  payload: Payload,
  options: CollectOptions,
): Promise<CollectResult> {
  const teams = await payload.find({ collection: "teams", sort: "sortOrder", limit: 50, depth: 0 });

  const fixtures: SourceFixture[] = [];
  const tiers = { live: 0, collection: 0 };

  for (const team of teams.docs) {
    const live = options.useLive === false ? [] : await fromLive(team, options);
    if (live.length > 0) {
      fixtures.push(...live);
      tiers.live += live.length;
      continue;
    }

    const stored = await fromCollection(payload, team, options);
    fixtures.push(...stored);
    tiers.collection += stored.length;
  }

  fixtures.sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
  return { fixtures, tiers };
}
