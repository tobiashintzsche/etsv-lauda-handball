import type { LeagueTableBlock, Team } from "@payload-types";

import { getSiteSettings } from "@/lib/globals";
import { getLeagueTable } from "@/lib/handball/table";
import { handballTableUrl } from "@/lib/handball/urls";
import { isPopulated } from "@/lib/utils";

import { LeagueTableSection } from "./Component";

/**
 * Data side of the league table block: resolves the team relationship, asks
 * handball.net for the table (falling back to last season's closing table) and
 * hands plain props to the presentational component.
 *
 * Renders nothing when the relationship is unpopulated — that only happens if
 * an editor deletes a team that a page still points at, and a blank section
 * beats a crash.
 */
export async function LeagueTableServer({ block }: { block: LeagueTableBlock }) {
  const team = isPopulated<Team>(block.team) ? block.team : null;
  if (!team) return null;

  const [settings, table] = await Promise.all([
    getSiteSettings(),
    getLeagueTable({
      tournamentId: team.handballNet?.tournamentId,
      teamId: team.handballNet?.teamId,
    }),
  ]);

  return (
    <LeagueTableSection
      headline={block.headline || team.name}
      subline={team.liga}
      clubName={settings.siteName}
      table={table}
      attributionHref={handballTableUrl(
        team.handballNet?.teamId,
        team.handballNet?.tournamentId,
        settings.handballNet?.clubId,
      )}
      background={block.sectionBackground}
      anchorId={block.anchorId}
    />
  );
}
