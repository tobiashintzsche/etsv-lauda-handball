import type { HighlightBanner } from "@payload-types";

import { formatGameDate } from "@/lib/format";
import { CONTAINER, cn } from "@/lib/utils";

type MatchdayEventProps = {
  event: NonNullable<HighlightBanner["event"]>;
};

/**
 * Termin-Variante der Matchday-Leiste — gleiche weisse Leiste, gleiche
 * Dreiteilung wie beim Spiel: Datum links, Anlass in der Mitte, Ort rechts.
 */
export function MatchdayEvent({ event }: MatchdayEventProps) {
  const date = event.date ? formatGameDate(event.date) : null;

  return (
    <div className="text-fg-secondary bg-white">
      <div
        className={cn(
          CONTAINER,
          "flex flex-col items-center gap-2 py-2 text-center",
          "md:flex-row md:justify-between md:gap-6 md:py-4 md:text-left",
        )}
      >
        {date ? <p className="text-[14px] md:text-[16px]">{date}</p> : null}

        <div className="flex flex-col items-center md:flex-1">
          {event.preHeadline ? (
            <p className="label-italic text-[12px] uppercase">{event.preHeadline}</p>
          ) : null}
          <p className="heading-italic text-[20px] md:text-[24px]">{event.headline}</p>
        </div>

        {event.location ? (
          <p className="shrink-0 text-[14px] md:text-[16px]">{event.location}</p>
        ) : null}
      </div>
    </div>
  );
}
