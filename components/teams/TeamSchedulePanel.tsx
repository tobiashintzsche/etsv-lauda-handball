import type { Team } from "@payload-types";

import { HandballAttribution } from "@/components/ui/HandballAttribution";
import { getTeamFixtures } from "@/lib/handball/schedule";
import type { ScheduleFixture } from "@/lib/handball/types";
import { handballScheduleUrl } from "@/lib/handball/urls";

import { HandballPanelHead } from "./HandballPanelHead";
import { MatchcenterCard } from "./MatchcenterCard";

const MAX_PER_GROUP = 4;

const LABELS = {
  recent: "Letzte Spiele",
  upcoming: "Kommende Spiele",
  empty: "Für diese Mannschaft sind noch keine Spiele hinterlegt.",
  attribution: "Zum Spielplan",
};

type TeamSchedulePanelProps = {
  team: Team;
  /** Club name and crest from `site-settings`. */
  clubName: string;
  clubLogoUrl?: string | null;
  clubId?: string | null;
};

function GameGroup({ label, fixtures }: { label: string; fixtures: ScheduleFixture[] }) {
  if (fixtures.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="label-italic text-secondary text-[14px] uppercase">{label}</h3>
      <div className="grid gap-8 md:grid-cols-2 md:gap-x-16">
        {fixtures.map((fixture) => (
          <MatchcenterCard key={fixture.id} fixture={fixture} />
        ))}
      </div>
    </div>
  );
}

/**
 * Contents of one accordion section: the team's last results and its next
 * fixtures, framed by the handball.net head and the mandatory attribution.
 *
 * The fixtures come from handball.net first and from our own `games`
 * collection when the federation has nothing published — `getTeamFixtures`
 * owns that cascade, this component only lays the cards out.
 */
export async function TeamSchedulePanel({
  team,
  clubName,
  clubLogoUrl,
  clubId,
}: TeamSchedulePanelProps) {
  const schedule = await getTeamFixtures({
    teamId: team.id,
    handballTeamId: team.handballNet?.teamId,
    league: team.liga,
    clubName,
    clubLogoUrl,
    max: MAX_PER_GROUP,
  });

  return (
    <div className="flex flex-col gap-6">
      <HandballPanelHead clubName={clubName} />

      {schedule.source === "empty" ? (
        <p className="text-muted text-[14px] leading-[1.5] md:text-[16px]">{LABELS.empty}</p>
      ) : (
        <>
          <GameGroup label={LABELS.recent} fixtures={schedule.recent} />
          <GameGroup label={LABELS.upcoming} fixtures={schedule.upcoming} />
        </>
      )}

      <HandballAttribution
        href={handballScheduleUrl(team.handballNet?.teamId, clubId)}
        label={LABELS.attribution}
        className="items-start"
      />
    </div>
  );
}
