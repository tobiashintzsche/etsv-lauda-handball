import { createHash } from "node:crypto";

import {
  berlinDate,
  berlinDateKey,
  berlinTime,
  berlinWeekdayName,
  berlinWeekdayShort,
  matchdayKey,
} from "./datetime";
import { maxRowsForGroups } from "./design";
import type { MatchdayPostDraft, MatchdayPostGame, MatchdayPostType, SourceFixture } from "./types";

/**
 * The generator core — pure functions, no Payload, no network, no clock.
 *
 * Everything the pipeline decides happens here so it can be unit-tested:
 * which fixtures form a matchday, how they split into posts, in which order the
 * rows appear, and which key makes a proposal idempotent.
 */

/** Post-type labels in the club's wording. Singular when a post carries one game. */
const TYPE_LABELS: Record<MatchdayPostType, { one: string; many: string }> = {
  heim: { one: "Heimspiel", many: "Heimspiele" },
  auswaerts: { one: "Auswärtsspiel", many: "Auswärtsspiele" },
  gemischt: { one: "Spieltag", many: "Spieltag" },
};

/** Badge text of a post. Uppercase — the design types it versal. */
export function badgeTextFor(postType: MatchdayPostType, gameCount: number): string {
  const label = TYPE_LABELS[postType];
  return (gameCount > 1 ? label.many : label.one).toUpperCase();
}

/** Sorts ascending by kick-off — earliest game first, in every list we build. */
export function byKickoff(a: SourceFixture, b: SourceFixture): number {
  return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
}

/**
 * Groups fixtures into matchdays: Friday–Sunday of one weekend belong together,
 * every other weekday stands alone. Result is ordered by matchday, fixtures
 * inside a matchday by kick-off.
 */
export function clusterFixtures(
  fixtures: readonly SourceFixture[],
): { key: string; fixtures: SourceFixture[] }[] {
  const clusters = new Map<string, SourceFixture[]>();

  for (const fixture of fixtures) {
    const key = matchdayKey(fixture.kickoff);
    const bucket = clusters.get(key);
    if (bucket) bucket.push(fixture);
    else clusters.set(key, [fixture]);
  }

  return [...clusters.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, list]) => ({ key, fixtures: [...list].sort(byKickoff) }));
}

/** How many headline groups a post of this type and content would render. */
export function groupCountFor(postType: MatchdayPostType, fixtures: readonly SourceFixture[]) {
  if (postType === "gemischt") {
    const home = fixtures.some((f) => f.isOwnHome);
    const away = fixtures.some((f) => !f.isOwnHome);
    return (home ? 1 : 0) + (away ? 1 : 0);
  }
  return new Set(fixtures.map((f) => berlinDateKey(f.kickoff))).size;
}

/** Does this set of fixtures fit on one screen as a post of that type? */
export function fitsOnScreen(
  postType: MatchdayPostType,
  fixtures: readonly SourceFixture[],
): boolean {
  if (fixtures.length === 0) return true;
  return fixtures.length <= maxRowsForGroups(groupCountFor(postType, fixtures));
}

/**
 * Splits a same-type list into as few screens as possible.
 *
 * Greedy in kick-off order: keep adding rows while the result still fits, start
 * a new screen when it does not. A single fixture always forms a screen, even
 * in the impossible case that it would not fit.
 */
export function splitIntoScreens(
  postType: MatchdayPostType,
  fixtures: readonly SourceFixture[],
): SourceFixture[][] {
  const screens: SourceFixture[][] = [];
  let current: SourceFixture[] = [];

  for (const fixture of [...fixtures].sort(byKickoff)) {
    const candidate = [...current, fixture];
    if (current.length > 0 && !fitsOnScreen(postType, candidate)) {
      screens.push(current);
      current = [fixture];
    } else {
      current = candidate;
    }
  }

  if (current.length > 0) screens.push(current);
  return screens;
}

/**
 * Post split of one matchday.
 *
 * Rule from the club: home and away games never share a post — the badge
 * carries that distinction. The one exception is the single-screen case: if
 * everything of the matchday fits on one screen together, one mixed post is
 * nicer than two half-empty ones.
 */
export function splitMatchday(
  fixtures: readonly SourceFixture[],
): { postType: MatchdayPostType; fixtures: SourceFixture[] }[] {
  const sorted = [...fixtures].sort(byKickoff);
  const home = sorted.filter((f) => f.isOwnHome);
  const away = sorted.filter((f) => !f.isOwnHome);

  if (home.length > 0 && away.length > 0 && fitsOnScreen("gemischt", sorted)) {
    return [{ postType: "gemischt", fixtures: sorted }];
  }

  return [
    ...splitIntoScreens("heim", home).map((f) => ({ postType: "heim" as const, fixtures: f })),
    ...splitIntoScreens("auswaerts", away).map((f) => ({
      postType: "auswaerts" as const,
      fixtures: f,
    })),
  ];
}

/**
 * Idempotency key of a proposal: post type + matchday + the fixtures it shows.
 *
 * Re-running the pipeline on unchanged data has to produce the exact same key,
 * otherwise every run would pile up duplicates. Changing the set of fixtures
 * intentionally produces a new key — that is a different post.
 */
export function buildSourceKey(
  postType: MatchdayPostType,
  matchday: string,
  sourceGameIds: readonly string[],
): string {
  const ids = [...sourceGameIds].map(String).sort();
  const digest = createHash("sha1").update(ids.join("|")).digest("hex").slice(0, 10);
  return `${postType}-${matchday}-${digest}`;
}

/** Snapshot row from a fixture — what actually lands in the document. */
export function toPostGame(fixture: SourceFixture): MatchdayPostGame {
  return {
    time: berlinTime(fixture.kickoff),
    date: fixture.kickoff,
    homeTeam: fixture.homeTeam,
    awayTeam: fixture.awayTeam,
    venue: fixture.venue ?? null,
    league: fixture.league ?? null,
    isOwnHome: fixture.isOwnHome,
    sourceGameId: fixture.sourceGameId,
  };
}

/** Our team of a fixture — the post always names us first, home or away. */
export function ownTeamOf(game: { homeTeam: string; awayTeam: string; isOwnHome: boolean }) {
  return game.isOwnHome ? game.homeTeam : game.awayTeam;
}

/** The opponent of a fixture. */
export function opponentOf(game: { homeTeam: string; awayTeam: string; isOwnHome: boolean }) {
  return game.isOwnHome ? game.awayTeam : game.homeTeam;
}

/** Document title, e.g. `Heimspiele · Sa, 19.09.2026`. */
export function buildTitle(postType: MatchdayPostType, fixtures: readonly SourceFixture[]): string {
  const label = fixtures.length > 1 ? TYPE_LABELS[postType].many : TYPE_LABELS[postType].one;
  const first = fixtures[0];
  if (!first) return label;

  const last = fixtures[fixtures.length - 1];
  const start = `${berlinWeekdayShort(first.kickoff)}, ${berlinDate(first.kickoff)}`;
  if (berlinDateKey(first.kickoff) === berlinDateKey(last.kickoff)) return `${label} · ${start}`;

  const end = `${berlinWeekdayShort(last.kickoff)}, ${berlinDate(last.kickoff)}`;
  return `${label} · ${start} – ${end}`;
}

/** When the games take place, as a caption phrase. */
function whenPhrase(fixtures: readonly SourceFixture[]): string {
  const first = fixtures[0];
  const last = fixtures[fixtures.length - 1];
  if (!first || !last) return "";

  if (berlinDateKey(first.kickoff) === berlinDateKey(last.kickoff)) {
    return `am ${berlinWeekdayName(first.kickoff)}, ${berlinDate(first.kickoff)}`;
  }
  return `am Wochenende vom ${berlinDate(first.kickoff)} bis ${berlinDate(last.kickoff)}`;
}

const CAPTION_INTRO: Record<MatchdayPostType, string> = {
  heim: "Unsere Heimspiele",
  auswaerts: "Unsere Auswärtsspiele",
  gemischt: "Unsere Spiele",
};

const CAPTION_INTRO_SINGULAR: Record<MatchdayPostType, string> = {
  heim: "Unser Heimspiel",
  auswaerts: "Unser Auswärtsspiel",
  gemischt: "Unser Spiel",
};

const CAPTION_OUTRO: Record<MatchdayPostType, string> = {
  heim: "Kommt vorbei und unterstützt uns in der Halle!",
  auswaerts: "Daumen drücken — wir berichten nach dem Abpfiff.",
  gemischt: "Kommt vorbei und drückt uns die Daumen!",
};

const HASHTAGS: Record<MatchdayPostType, string> = {
  heim: "#etsvlauda #handball #heimspiel",
  auswaerts: "#etsvlauda #handball #auswärtsspiel",
  gemischt: "#etsvlauda #handball #spieltag",
};

/**
 * Caption proposal for Instagram. Deliberately emoji-poor and in the club's
 * tone — the editor rewrites it in the admin, v2 posts it.
 */
export function buildCaption(
  postType: MatchdayPostType,
  fixtures: readonly SourceFixture[],
): string {
  if (fixtures.length === 0) return "";

  const intro = fixtures.length > 1 ? CAPTION_INTRO[postType] : CAPTION_INTRO_SINGULAR[postType];
  const lines = fixtures.map((fixture) => {
    const time = berlinTime(fixture.kickoff);
    return `• ${time} Uhr · ${ownTeamOf(fixture)} vs. ${opponentOf(fixture)}`;
  });

  return [
    `🤾 Spieltag! ${intro} ${whenPhrase(fixtures)}:`,
    "",
    ...lines,
    "",
    CAPTION_OUTRO[postType],
    "",
    HASHTAGS[postType],
  ].join("\n");
}

/** One proposal from one already-split group of fixtures. */
export function buildDraft(
  postType: MatchdayPostType,
  matchday: string,
  fixtures: readonly SourceFixture[],
): MatchdayPostDraft {
  const sorted = [...fixtures].sort(byKickoff);

  return {
    sourceKey: buildSourceKey(
      postType,
      matchday,
      sorted.map((f) => f.sourceGameId),
    ),
    title: buildTitle(postType, sorted),
    postType,
    dateFrom: sorted[0].kickoff,
    dateTo: sorted[sorted.length - 1].kickoff,
    caption: buildCaption(postType, sorted),
    games: sorted.map(toPostGame),
  };
}

/**
 * The whole generator: fixtures in, post proposals out.
 *
 * Deterministic — same input, same output, same order, same source keys.
 */
export function generateDrafts(fixtures: readonly SourceFixture[]): MatchdayPostDraft[] {
  return clusterFixtures(fixtures).flatMap((cluster) =>
    splitMatchday(cluster.fixtures).map((group) =>
      buildDraft(group.postType, cluster.key, group.fixtures),
    ),
  );
}
