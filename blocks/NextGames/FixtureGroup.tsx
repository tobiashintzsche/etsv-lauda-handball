import type { Game, Team } from "@payload-types";

import { formatDate, formatTime } from "@/lib/format";
import { cn, isPopulated } from "@/lib/utils";

type FixtureGroupProps = {
  /** Badge caption — „Heimspiele“ / „Auswaertsspiele“, set uppercase by CSS. */
  label: string;
  games: Game[];
  empty: string;
};

const TIME_ZONE = "Europe/Berlin";

/** Suffix on the first fixture line, uppercased by CSS: „HERREN VS“. */
const VS_SUFFIX = "vs";

/**
 * Row colour, reset in every group: first row white, then alternating.
 * Spec §5.2 — pure text colour, never a filled zebra stripe.
 */
function rowTone(index: number): string {
  return index % 2 === 0 ? "text-fg-primary" : "text-secondary";
}

/** The post breaks after „VS“; an unpopulated team leaves just the opponent. */
function fixtureLines(game: Game): [string, string | null] {
  const teamName = isPopulated<Team>(game.team) ? game.team.name : "";
  return teamName ? [`${teamName} ${VS_SUFFIX}`, game.opponent] : [game.opponent, null];
}

/**
 * „Sa, 27.09.2025 · Sporthalle Lauda“ — web-only addition. The post carries
 * neither date nor venue (spec §5.1), but a website visitor needs both, so they
 * ride along as a quiet Roboto line under the fixture.
 */
function fixtureMeta(game: Game): string {
  const date = new Date(game.date);
  if (Number.isNaN(date.getTime())) return game.venue ?? "";

  const weekday = new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    timeZone: TIME_ZONE,
  }).format(date);

  return [`${weekday}, ${formatDate(date)}`, game.venue].filter(Boolean).join(" · ");
}

function FixtureRow({ game, index }: { game: Game; index: number }) {
  const [firstLine, secondLine] = fixtureLines(game);
  const meta = fixtureMeta(game);

  return (
    <li className={cn("flex items-center justify-between gap-4 md:gap-8", rowTone(index))}>
      <div className="min-w-0 flex-1">
        <p className="font-anton text-[14px] leading-[1.25] uppercase md:text-[16px]">
          <span className="block">{firstLine}</span>
          {secondLine ? <span className="block">{secondLine}</span> : null}
        </p>
        {meta ? (
          <p className="text-muted mt-1 text-[10px] leading-[1.3] md:text-[12px]">{meta}</p>
        ) : null}
      </div>

      <time
        dateTime={game.date}
        className="font-anton shrink-0 text-[26px] leading-none tabular-nums md:text-[32px]"
      >
        {formatTime(game.date)}
      </time>
    </li>
  );
}

/**
 * One group of the matchday post: yellow badge plus its fixture rows.
 *
 * The post separates by day (SAMSTAG / SONNTAG); the website separates home
 * from away — same mechanic, different caption (spec §9.2). The badge is
 * inverted against the post (yellow surface, navy type instead of black
 * surface, yellow type): on the navy section a black block reads as a hole,
 * and yellow-on-navy keeps the site's own colour pair.
 */
export function FixtureGroup({ label, games, empty }: FixtureGroupProps) {
  return (
    <div>
      <h3 className="bg-secondary text-primary font-anton w-fit px-3.5 py-1 text-[26px] leading-[1.3] font-normal uppercase not-italic md:px-4 md:py-1 md:text-[36px]">
        {label}
      </h3>

      {games.length === 0 ? (
        <p className="text-muted mt-3.5 text-[14px] leading-[1.4] md:mt-5 md:pl-4 md:text-[16px]">
          {empty}
        </p>
      ) : (
        <ul className="mt-3.5 flex flex-col gap-4 md:mt-5 md:gap-7 md:pl-4">
          {games.map((game, index) => (
            <FixtureRow key={game.id} game={game} index={index} />
          ))}
        </ul>
      )}
    </div>
  );
}
