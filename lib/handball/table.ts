import { type TableResult, getTable, getTeamTable } from "./client";
import { findFixtureTable } from "./fixtures";
import { resolveLogoUrl } from "./logo";
import { findClubLogoUrl, isOwnClub } from "./opponent-logos";
import type { FixtureTable, HandballTableRow, LeagueTable, LeagueTableRow } from "./types";

/**
 * Turns handball.net data into the rows the table component renders.
 *
 * Three tiers, in order:
 *   1. live table for the current season
 *   2. archived closing table of 2025/26, labelled as such
 *   3. empty — the component shows its empty state, nothing crashes
 *
 * Tier 2 is not a stopgap: between June and September no German league has a
 * table, and an empty box on every team page would look broken.
 */

/** Crests render at 24px; ask handball.net for a small variant. */
const LOGO_WIDTH = 48;

function fromApiRow(row: HandballTableRow): LeagueTableRow {
  const teamName = row.team?.name ?? "";
  return {
    rank: row.rank,
    teamId: row.team?.id ?? teamName,
    teamName,
    logoUrl: resolveLogoUrl(row.team?.logo, LOGO_WIDTH) ?? findClubLogoUrl(teamName, LOGO_WIDTH),
    games: row.games,
    goals: `${row.goals}:${row.goalsAgainst}`,
    points: row.points,
    isOwnClub: isOwnClub(teamName),
  };
}

function fromFixtureRow(row: FixtureTable["rows"][number]): LeagueTableRow {
  return {
    rank: row.rank,
    teamId: row.teamId,
    teamName: row.teamName,
    logoUrl: resolveLogoUrl(row.logo, LOGO_WIDTH) ?? findClubLogoUrl(row.teamName, LOGO_WIDTH),
    games: row.games,
    goals: `${row.goals}:${row.goalsAgainst}`,
    points: row.points,
    isOwnClub: isOwnClub(row.teamName),
  };
}

const EMPTY: LeagueTable = { source: "empty", rows: [], tournamentName: null, label: null };

function toLive(result: TableResult | null): LeagueTable | null {
  if (!result || result.rows.length === 0) return null;
  return {
    source: "live",
    rows: result.rows.map(fromApiRow),
    tournamentName: result.tournamentName,
    label: null,
  };
}

export type LeagueTableQuery = {
  /** handball.net league id from the team document. */
  tournamentId?: string | null;
  /** handball.net team id — second chance, and the fixture lookup key. */
  teamId?: string | null;
};

/**
 * League table for one team. Never throws and never returns `null` — the
 * `source` field tells the component which of the three states it got.
 */
export async function getLeagueTable(query: LeagueTableQuery): Promise<LeagueTable> {
  const { tournamentId, teamId } = query;

  if (tournamentId) {
    const live = toLive(await getTable(tournamentId));
    if (live) return live;
  }

  if (teamId) {
    const live = toLive(await getTeamTable(teamId));
    if (live) return live;
  }

  const fixture = findFixtureTable(tournamentId, teamId);
  if (fixture) {
    return {
      source: "fixture",
      rows: fixture.rows.map(fromFixtureRow),
      tournamentName: fixture.tournamentName,
      label: `Abschlusstabelle ${fixture.season}`,
    };
  }

  return EMPTY;
}
