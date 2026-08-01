import { formatTime } from "@/lib/format";
import type { ScheduleFixture, ScheduleTeam } from "@/lib/handball/types";
import { cn } from "@/lib/utils";

import { ClubCrest } from "./ClubCrest";

type MatchcenterCardProps = {
  fixture: ScheduleFixture;
};

const TIME_ZONE = "Europe/Berlin";

/** "Samstag, 26.4.2025" — the matchcenter date line. */
function formatMatchDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
}

function TeamRow({ team }: { team: ScheduleTeam }) {
  return (
    <div className="flex h-[39px] items-center gap-3">
      <ClubCrest name={team.name} logoUrl={team.logoUrl} />
      <span className={cn("truncate text-[16px] leading-[1.2]", team.isOwnClub && "font-semibold")}>
        {team.name}
      </span>
    </div>
  );
}

/**
 * One fixture in the matchcenter (design 3.15): date, league, both clubs with
 * their crest and the score in a yellow badge.
 *
 * Fixtures without a result keep the exact same frame — the badge slot then
 * carries the throw-off time, so a column of played and upcoming games still
 * lines up instead of jumping.
 */
export function MatchcenterCard({ fixture }: MatchcenterCardProps) {
  const hasResult = fixture.homeGoals != null && fixture.awayGoals != null;

  return (
    <article className="flex flex-col">
      <p className="border-fg-primary border-b py-1.5 text-[14px] leading-[28px]">
        <time dateTime={fixture.kickoff}>{formatMatchDate(fixture.kickoff)}</time>
      </p>

      {fixture.league ? (
        <p className="truncate py-1.5 text-[14px] leading-[28px]">{fixture.league}</p>
      ) : null}

      <div className="mt-1 flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <TeamRow team={fixture.home} />
          <TeamRow team={fixture.away} />
        </div>

        <div
          className={cn(
            "bg-secondary text-primary rounded-score flex h-[78px] w-[50px] shrink-0",
            "flex-col items-center justify-center gap-3 font-sans text-[16px] font-semibold not-italic",
          )}
        >
          {hasResult ? (
            <>
              <span>{fixture.homeGoals}</span>
              <span>{fixture.awayGoals}</span>
            </>
          ) : (
            <span className="text-center text-[14px] leading-tight">
              {formatTime(fixture.kickoff)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
