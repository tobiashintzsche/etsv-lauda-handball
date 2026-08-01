import type { Game } from "@payload-types";

import { getNextGames, getRecentGames } from "@/lib/games";
import { isMedia } from "@/lib/utils";

import { getTeamSchedule } from "./client";
import { resolveLogoUrl } from "./logo";
import { findClubLogoUrl, isOwnClub } from "./opponent-logos";
import type {
  HandballGameSummary,
  HandballTeamSummary,
  ScheduleFixture,
  ScheduleTeam,
  TeamSchedule,
} from "./types";

/**
 * Fixtures of one team, in the shape the matchcenter renders.
 *
 * Three tiers, in order:
 *   1. live schedule from handball.net — the federation's own data, crests
 *      included, updated within minutes of a result being entered
 *   2. our `games` collection — editor-maintained, works when handball.net is
 *      unreachable and when the federation has not published anything yet
 *   3. empty — the panel shows its empty state, nothing crashes
 *
 * Tier 2 is the normal state right now: season 2026/27 starts in September
 * 2026 and every team schedule comes back as an empty list until then. As soon
 * as the federations publish, tier 1 takes over on its own — no deploy needed.
 */

/** Crests render at 24px; ask handball.net for a small variant. */
const LOGO_WIDTH = 48;

/** Games per group. Four fits the two-column card grid without scrolling. */
const DEFAULT_MAX = 4;

/**
 * Our crest when `site-settings` carries none. A repo asset rather than the
 * handball.net SVG: our own club must not disappear from a card because a
 * third-party CDN is having a bad day.
 */
const OWN_CREST_FALLBACK = "/brand/club-crest-etsv-lauda-2.png";

export type TeamScheduleQuery = {
  /** Payload id of the team — key for the `games` fallback. */
  teamId: string | number;
  /** handball.net team id from the team document. Without it there is no tier 1. */
  handballTeamId?: string | null;
  /**
   * Phase id of an archived season (`tournamentSeason`). Only needed to look
   * back: a current team id returns its own season without any parameter.
   */
  tournamentSeason?: string | null;
  /** League label for fallback fixtures — the API names its own. */
  league?: string | null;
  /** Our club as `site-settings` names it. */
  clubName: string;
  /** Our crest, already resolved to a URL. */
  clubLogoUrl?: string | null;
  /** Games per group. */
  max?: number;
};

const EMPTY: TeamSchedule = { source: "empty", recent: [], upcoming: [] };

/* ── Tier 1: live handball.net ─────────────────────────────────────────── */

function fromApiTeam(team?: HandballTeamSummary | null): ScheduleTeam {
  const name = team?.name ?? "";
  return {
    name,
    // The API ships a crest with almost every team; the map catches the rest.
    logoUrl: resolveLogoUrl(team?.logo, LOGO_WIDTH) ?? findClubLogoUrl(name, LOGO_WIDTH),
    isOwnClub: isOwnClub(name),
  };
}

function fromApiGame(game: HandballGameSummary): ScheduleFixture {
  // Report point 7: a score only counts once the game is officially over.
  const played = game.state === "Post" && game.homeGoals != null && game.awayGoals != null;

  return {
    id: game.id,
    kickoff: new Date(game.startsAt).toISOString(),
    league: game.tournament?.name ?? null,
    home: fromApiTeam(game.homeTeam),
    away: fromApiTeam(game.awayTeam),
    homeGoals: played ? (game.homeGoals ?? null) : null,
    awayGoals: played ? (game.awayGoals ?? null) : null,
  };
}

async function fromApi(query: TeamScheduleQuery): Promise<TeamSchedule | null> {
  if (!query.handballTeamId) return null;

  const games = await getTeamSchedule(query.handballTeamId, query.tournamentSeason ?? undefined);
  // `startsAt` carries the whole ordering — a fixture without it is unusable.
  const dated = games.filter((game) => Number.isFinite(game.startsAt));
  if (dated.length === 0) return null;

  const max = query.max ?? DEFAULT_MAX;
  const now = Date.now();

  const recent = dated
    .filter((game) => game.startsAt < now)
    .sort((a, b) => b.startsAt - a.startsAt)
    .slice(0, max)
    .map(fromApiGame);

  const upcoming = dated
    .filter((game) => game.startsAt >= now)
    .sort((a, b) => a.startsAt - b.startsAt)
    .slice(0, max)
    .map(fromApiGame);

  return { source: "live", recent, upcoming };
}

/* ── Tier 2: our own games collection ──────────────────────────────────── */

function fromGame(game: Game, query: TeamScheduleQuery): ScheduleFixture {
  const uploaded = isMedia(game.opponentLogo) ? game.opponentLogo.url : null;

  const opponent: ScheduleTeam = {
    name: game.opponent,
    // An editor-uploaded crest wins — it is the deliberate choice over ours.
    logoUrl: uploaded ?? findClubLogoUrl(game.opponent, LOGO_WIDTH),
    isOwnClub: false,
  };

  const own: ScheduleTeam = {
    name: query.clubName,
    logoUrl: query.clubLogoUrl ?? OWN_CREST_FALLBACK,
    isOwnClub: true,
  };

  const isHome = game.homeAway === "home";
  const scoreFor = game.result?.scoreFor ?? null;
  const scoreAgainst = game.result?.scoreAgainst ?? null;

  return {
    id: String(game.id),
    kickoff: game.date,
    league: query.league ?? null,
    home: isHome ? own : opponent,
    away: isHome ? opponent : own,
    homeGoals: isHome ? scoreFor : scoreAgainst,
    awayGoals: isHome ? scoreAgainst : scoreFor,
  };
}

async function fromCollection(query: TeamScheduleQuery): Promise<TeamSchedule | null> {
  const max = query.max ?? DEFAULT_MAX;

  const [recent, next] = await Promise.all([
    getRecentGames(query.teamId, max),
    getNextGames({ teamId: query.teamId, maxPerColumn: max }),
  ]);

  // `getNextGames` splits by venue for the "Nächste Spiele" block; the
  // matchcenter wants one chronological list.
  const upcoming = [...next.home, ...next.away]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, max);

  if (recent.length === 0 && upcoming.length === 0) return null;

  return {
    source: "collection",
    recent: recent.map((game) => fromGame(game, query)),
    upcoming: upcoming.map((game) => fromGame(game, query)),
  };
}

/**
 * Fixtures of one team. Never throws and never returns `null` — the `source`
 * field tells the caller which of the three tiers answered.
 */
export async function getTeamFixtures(query: TeamScheduleQuery): Promise<TeamSchedule> {
  const live = await fromApi(query);
  if (live) return live;

  const stored = await fromCollection(query);
  if (stored) return stored;

  return EMPTY;
}
