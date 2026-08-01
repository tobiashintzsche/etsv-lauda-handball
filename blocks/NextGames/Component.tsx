import type { Game, Team } from "@payload-types";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionShell } from "@/components/ui/SectionShell";
import type { SectionBackground } from "@/fields/section";
import { formatDate, formatTime } from "@/lib/format";
import { strings } from "@/lib/strings";
import { isPopulated } from "@/lib/utils";

type NextGamesSectionProps = {
  headline: string;
  subline?: string | null;
  home: Game[];
  away: Game[];
  background?: SectionBackground | string | null;
  anchorId?: string | null;
};

/** Shown when neither column has a single fixture — June to September, every year. */
const SEASON_BREAK = "Saisonpause — aktuell keine angesetzten Spiele";

const TIME_ZONE = "Europe/Berlin";

/** "Samstag 20.09.2025 16:00 Uhr" — the fixture list wording from the design. */
function formatKickoff(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const weekday = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    timeZone: TIME_ZONE,
  }).format(date);

  return `${weekday} ${formatDate(date)} ${formatTime(date)} Uhr`;
}

/** "HERREN VS. SG GUNDELSHEIM" — our team always comes first, home or away. */
function fixtureTitle(game: Game): string {
  const teamName = isPopulated<Team>(game.team) ? game.team.name : "";
  return teamName ? `${teamName} vs. ${game.opponent}` : game.opponent;
}

function FixtureList({ games, empty }: { games: Game[]; empty: string }) {
  if (games.length === 0) {
    return <p className="text-muted text-[16px] leading-[1.1]">{empty}</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {games.map((game) => (
        <li key={game.id} className="flex flex-col gap-3">
          <p className="text-fg-primary text-[16px] leading-[1.1] font-semibold uppercase">
            {fixtureTitle(game)}
          </p>
          <div className="flex flex-col gap-0.5 text-[16px] leading-[1.1]">
            <time dateTime={game.date}>{formatKickoff(game.date)}</time>
            {game.venue ? <span>{game.venue}</span> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * „Nächste Spiele“ in two columns (design 3.6).
 *
 * Purely presentational — the fixtures are loaded in `Server.tsx`. Mobile
 * stacks the two columns; the design does not scroll them sideways because a
 * fixture is text, not a card.
 */
export function NextGamesSection({
  headline,
  subline,
  home,
  away,
  background,
  anchorId,
}: NextGamesSectionProps) {
  const isEmpty = home.length === 0 && away.length === 0;

  return (
    <SectionShell background={background} anchorId={anchorId}>
      <SectionHeader headline={headline} subline={subline} />

      <hr className="border-fg-primary mt-3 border-t-2" />

      {isEmpty ? (
        <p className="text-muted mt-6 text-[14px] leading-[1.5] md:text-[16px]">{SEASON_BREAK}</p>
      ) : (
        <div className="mt-6 flex flex-col gap-8 md:flex-row md:gap-4">
          <div className="flex flex-1 flex-col gap-4">
            <h3 className="label-italic text-secondary text-[18px] uppercase">
              {strings.games.home}
            </h3>
            <FixtureList games={home} empty={strings.games.emptyHome} />
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <h3 className="label-italic text-secondary text-[18px] uppercase">
              {strings.games.away}
            </h3>
            <FixtureList games={away} empty={strings.games.emptyAway} />
          </div>
        </div>
      )}
    </SectionShell>
  );
}
