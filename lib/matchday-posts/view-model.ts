import { berlinDateKey, berlinWeekdayName } from "./datetime";
import { badgeTextFor, opponentOf, ownTeamOf } from "./generate";
import type {
  MatchdayPostGame,
  MatchdayPostType,
  MatchdayPostVariant,
  MatchdayPostView,
  MatchdayViewGroup,
  MatchdayViewRow,
} from "./types";

/**
 * Turns a stored post into what the two renderers draw.
 *
 * The colour alternation lives here and nowhere else — it is render logic, not
 * data (§5.2 of the spec): row 1 of EVERY group is white, then yellow/white,
 * and the alternation restarts in each group instead of running through the
 * whole post.
 */

/** Headline of the home/away groups in a mixed post (spec §9.2). */
const MIXED_LABELS = { home: "HEIM", away: "AUSWÄRTS" } as const;

/** What `buildPostView` needs — a subset of the collection document. */
export type MatchdayPostSource = {
  postType: MatchdayPostType;
  variant?: MatchdayPostVariant | null;
  badgeText?: string | null;
  games?: MatchdayPostGame[] | null;
  overlayTitle?: string | null;
  overlayImageUrl?: string | null;
  overlayImageAlt?: string | null;
};

function sortGames(games: readonly MatchdayPostGame[]): MatchdayPostGame[] {
  return [...games].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function toRow(game: MatchdayPostGame, index: number): MatchdayViewRow {
  return {
    team: ownTeamOf(game).toUpperCase(),
    opponent: opponentOf(game).toUpperCase(),
    value: game.time ?? "",
    color: index % 2 === 0 ? "white" : "yellow",
  };
}

function groupByDay(games: readonly MatchdayPostGame[]): MatchdayViewGroup[] {
  const buckets = new Map<string, MatchdayPostGame[]>();

  for (const game of games) {
    const key = berlinDateKey(game.date);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(game);
    else buckets.set(key, [game]);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, list]) => ({
      label: berlinWeekdayName(list[0].date).toUpperCase(),
      rows: list.map(toRow),
    }));
}

/** Mixed posts group by venue instead of by day — the badge cannot say both. */
function groupByVenue(games: readonly MatchdayPostGame[]): MatchdayViewGroup[] {
  const home = games.filter((game) => game.isOwnHome);
  const away = games.filter((game) => !game.isOwnHome);

  return [
    { label: MIXED_LABELS.home, rows: home.map(toRow) },
    { label: MIXED_LABELS.away, rows: away.map(toRow) },
  ].filter((group) => group.rows.length > 0);
}

/** The single white line of the photo variant, e.g. `HERREN VS SG HEUCHELBERG 3`. */
function overlayLine(post: MatchdayPostSource, game: MatchdayPostGame | undefined): string {
  const manual = post.overlayTitle?.trim();
  if (manual) return manual.toUpperCase();
  if (!game) return "";
  return `${ownTeamOf(game)} VS ${opponentOf(game)}`.toUpperCase();
}

/** Everything the post renderers consume. Never throws on an empty document. */
export function buildPostView(post: MatchdayPostSource): MatchdayPostView {
  const games = sortGames(post.games ?? []);
  const badge = post.badgeText?.trim()
    ? post.badgeText.trim().toUpperCase()
    : badgeTextFor(post.postType, games.length);

  if (post.variant === "bildOverlay") {
    const first = games[0];
    return {
      badge,
      groups: [],
      overlay: {
        imageUrl: post.overlayImageUrl ?? "",
        alt: post.overlayImageAlt ?? "",
        time: first?.time ?? "",
        line: overlayLine(post, first),
      },
    };
  }

  return {
    badge,
    groups: post.postType === "gemischt" ? groupByVenue(games) : groupByDay(games),
    overlay: null,
  };
}
