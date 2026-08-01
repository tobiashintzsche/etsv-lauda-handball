/**
 * Shapes of the public handball.net sportdata API (`/a/sportdata/1`).
 *
 * Only the fields this site actually renders are typed — the upstream payload
 * is considerably larger. Everything is optional-tolerant on purpose: the API
 * is unversioned and unauthenticated, so a missing field must never crash a
 * page. `points` really is a string ("30:2"), not a number.
 */

/** Every response is wrapped in this envelope. */
export type HandballEnvelope<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type HandballTeamSummary = {
  id: string;
  name: string;
  acronym?: string | null;
  /** Pseudo URI `handball-net:files/…` — resolve with `resolveLogoUrl`. */
  logo?: string | null;
  teamGroupId?: number | null;
};

export type HandballTournamentSummary = {
  id: string;
  name: string;
  acronym?: string | null;
};

/** One row of a league table as delivered by `/tournaments/{id}/table`. */
export type HandballTableRow = {
  /**
   * Null when the federation could not separate teams by direct comparison —
   * the table then repeats the rank of the team above.
   */
  rank: number | null;
  team: HandballTeamSummary;
  /** "30:2" — plus and minus points, NOT a number. */
  points: string;
  games: number;
  wins: number;
  draws: number;
  losses: number;
  goals: number;
  goalsAgainst: number;
  goalDifference: number;
};

export type HandballTableResponse = {
  tournament?: HandballTournamentSummary | null;
  tableType?: string | null;
  rows?: HandballTableRow[] | null;
  /** Unix milliseconds. */
  updatedAt?: number | null;
};

export type HandballField = {
  id: string;
  name?: string | null;
  acronym?: string | null;
  city?: string | null;
};

/** One fixture of `/teams/{id}/schedule`. */
export type HandballGameSummary = {
  id: string;
  tournament?: HandballTournamentSummary | null;
  field?: HandballField | null;
  homeTeam?: HandballTeamSummary | null;
  awayTeam?: HandballTeamSummary | null;
  /** Unix milliseconds. */
  startsAt: number;
  state?: "Pre" | "Live" | "Post" | null;
  homeGoals?: number | null;
  awayGoals?: number | null;
};

/* ── View models ──────────────────────────────────────────────────────────
   What the components consume. Flat, already resolved, no upstream quirks. */

export type LeagueTableRow = {
  /** Null for teams the federation left unranked. */
  rank: number | null;
  teamId: string;
  teamName: string;
  /** Absolute logo URL, or null when the club has none on file. */
  logoUrl: string | null;
  games: number;
  /** "486:354" */
  goals: string;
  /** "30:2" */
  points: string;
  /** True for the ETSV Lauda row — highlighted in the table. */
  isOwnClub: boolean;
};

/**
 * Where the rendered table came from.
 *
 * `live`    — current season, straight from the API
 * `fixture` — archived closing table, shown with a label while the new season
 *             has not produced any rows yet
 * `empty`   — nothing to show, the component renders its empty state
 */
export type LeagueTableSource = "live" | "fixture" | "empty";

export type LeagueTable = {
  source: LeagueTableSource;
  rows: LeagueTableRow[];
  /** Name of the league, e.g. "Neckar-Franken - Männer Bezirksklasse Gruppe 1". */
  tournamentName: string | null;
  /** Set for `fixture` only, e.g. "Abschlusstabelle 2025/26". */
  label: string | null;
};

/** One side of a fixture, ready to render. */
export type ScheduleTeam = {
  name: string;
  /** Absolute crest URL, or null — the card then shows the club's initials. */
  logoUrl: string | null;
  /** True for the ETSV Lauda side. */
  isOwnClub: boolean;
};

export type ScheduleFixture = {
  id: string;
  /** ISO 8601 kick-off. */
  kickoff: string;
  /** League name, e.g. "Neckar-Franken - Männer Bezirksklasse Gruppe 1". */
  league: string | null;
  home: ScheduleTeam;
  away: ScheduleTeam;
  /** Both null until the game has been played. */
  homeGoals: number | null;
  awayGoals: number | null;
};

/**
 * Where the rendered fixtures came from.
 *
 * `live`       — straight from the handball.net API
 * `collection` — our own `games` collection, the editor-maintained fallback
 * `empty`      — nothing to show, the panel renders its empty state
 */
export type TeamScheduleSource = "live" | "collection" | "empty";

export type TeamSchedule = {
  source: TeamScheduleSource;
  /** Played games, most recent first. */
  recent: ScheduleFixture[];
  /** Upcoming games, next one first. */
  upcoming: ScheduleFixture[];
};

/** Archived table shipped as JSON in `lib/handball/fixtures/`. */
export type FixtureTable = {
  season: string;
  tournamentId: string;
  tournamentName: string;
  /** Tournament and team ids (both seasons) that resolve to this table. */
  aliases: string[];
  rows: {
    rank: number | null;
    teamId: string;
    teamName: string;
    logo?: string | null;
    games: number;
    wins: number;
    draws: number;
    losses: number;
    points: string;
    goals: number;
    goalsAgainst: number;
    goalDifference: number;
  }[];
};
