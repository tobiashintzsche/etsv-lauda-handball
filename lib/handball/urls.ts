import { handballNetTeamUrl } from "@/lib/paths";

const LEAGUE_BASE = "https://www.handball.net/ligen";
const CLUB_BASE = "https://www.handball.net/vereine";

/**
 * Public handball.net page the mandatory attribution button links to.
 *
 * Preference order: the team's own table page, then the league table, then the
 * club overview — the button must always lead somewhere, it is a licence
 * condition and not decoration.
 */
export function handballTableUrl(
  teamId?: string | null,
  tournamentId?: string | null,
  clubId?: string | null,
): string {
  if (teamId) return handballNetTeamUrl(teamId, "tabelle");
  if (tournamentId) return `${LEAGUE_BASE}/${tournamentId}/tabelle`;
  if (clubId) return `${CLUB_BASE}/${clubId}`;
  return "https://www.handball.net";
}

/** Public fixture list of one team. */
export function handballScheduleUrl(teamId?: string | null, clubId?: string | null): string {
  if (teamId) return handballNetTeamUrl(teamId, "spielplan");
  if (clubId) return `${CLUB_BASE}/${clubId}`;
  return "https://www.handball.net";
}
