/** Shapes shared by the matchday-post pipeline, the renderers and the tests. */

/** `heim` and `auswaerts` never mix — `gemischt` only when everything fits one screen. */
export type MatchdayPostType = "heim" | "auswaerts" | "gemischt";

export type MatchdayPostStatus = "vorschlag" | "freigegeben" | "verworfen";

export type MatchdayPostVariant = "standard" | "bildOverlay";

/**
 * One fixture as the pipeline reads it — from handball.net or from our own
 * `games` collection, already normalised.
 *
 * `homeTeam` / `awayTeam` carry OUR team under its internal name ("Männer",
 * "weibl. A-Jugend"), not the club name: that is what the post prints.
 */
export type SourceFixture = {
  /** Stable id of the upstream fixture — the dedupe handle. */
  sourceGameId: string;
  /** ISO 8601 kick-off. */
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  /** True when we are the home side. Drives the home/away split. */
  isOwnHome: boolean;
  venue?: string | null;
  league?: string | null;
};

/** One row of the snapshot stored on the post document. */
export type MatchdayPostGame = {
  /** Free right-hand slot: `18:30`, a result `24:25`, an emoji or empty. */
  time: string;
  /** ISO kick-off — kept for sorting and the day headline. */
  date: string;
  homeTeam: string;
  awayTeam: string;
  venue?: string | null;
  league?: string | null;
  isOwnHome: boolean;
  sourceGameId?: string | null;
};

/** What the generator proposes. Maps 1:1 onto the collection fields. */
export type MatchdayPostDraft = {
  sourceKey: string;
  title: string;
  postType: MatchdayPostType;
  /** Kick-off of the first game of the post. */
  dateFrom: string;
  /** Kick-off of the last game of the post. */
  dateTo: string;
  caption: string;
  games: MatchdayPostGame[];
};

/* ── View model (render side) ─────────────────────────────────────────────
   The renderers never touch the raw document; they consume this. */

export type MatchdayRowColor = "white" | "yellow";

export type MatchdayViewRow = {
  /** Our team, uppercase — the post appends " VS" behind it. */
  team: string;
  opponent: string;
  /** Right-hand slot, verbatim. */
  value: string;
  /** Alternation, restarting at white in every group. */
  color: MatchdayRowColor;
};

export type MatchdayViewGroup = {
  /** `SAMSTAG`, `SONNTAG` — or `HEIM`/`AUSWÄRTS` in a mixed post. */
  label: string;
  rows: MatchdayViewRow[];
};

export type MatchdayViewOverlay = {
  imageUrl: string;
  alt: string;
  /** Big yellow kick-off next to the badge. */
  time: string;
  /** The single white line, e.g. `HERREN VS SG HEUCHELBERG 3`. */
  line: string;
};

export type MatchdayPostView = {
  badge: string;
  groups: MatchdayViewGroup[];
  /** Set only for the photo variant — then `groups` stays unused. */
  overlay: MatchdayViewOverlay | null;
};
