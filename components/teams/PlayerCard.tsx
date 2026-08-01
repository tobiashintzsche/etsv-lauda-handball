import Image from "next/image";

import type { Player } from "@payload-types";

import { cn, isMedia } from "@/lib/utils";

/** Position select value → the label printed on the card. */
const POSITION_LABELS: Record<string, string> = {
  torwart: "Torwart",
  linksaussen: "Linksaußen",
  "rueckraum-links": "Rückraum links",
  "rueckraum-mitte": "Rückraum Mitte",
  "rueckraum-rechts": "Rückraum rechts",
  rechtsaussen: "Rechtsaußen",
  kreislaeufer: "Kreisläufer",
};

type PlayerCardProps = {
  player: Player;
  className?: string;
};

/**
 * Player card, 263×334 (design 3.8).
 *
 * The photo appears twice: once blown up and dimmed to 17% as the card's own
 * background, once cut out on top. That is what makes the card read as a
 * trading card instead of a portrait in a box — one upload, two roles.
 *
 * The size is fixed because the cards live in a scroll track: a flexible width
 * would let the last card end flush with the viewport and kill the cue that
 * there is more to scroll.
 */
export function PlayerCard({ player, className }: PlayerCardProps) {
  const photo = isMedia(player.photo) ? player.photo : null;
  const position = player.position ? POSITION_LABELS[player.position] : null;

  return (
    <article
      className={cn(
        "bg-player-card shadow-card relative h-[334px] w-[263px] overflow-hidden",
        className,
      )}
    >
      {photo?.url ? (
        <>
          <Image
            src={photo.url}
            alt=""
            aria-hidden="true"
            fill
            sizes="263px"
            className="scale-150 object-cover opacity-[0.17]"
          />
          <div className="absolute top-[25px] left-[25px] h-[225px] w-[198px]">
            <Image
              src={photo.url}
              alt={photo.alt ?? player.name}
              fill
              sizes="198px"
              className="object-contain object-bottom"
            />
          </div>
        </>
      ) : null}

      <div className="bg-secondary absolute inset-x-0 bottom-0 flex h-[84px] items-stretch">
        <div className="flex w-[79px] shrink-0 items-center justify-center">
          {player.number != null ? (
            <span className="text-fg-secondary font-sans text-[32px] leading-none font-bold not-italic">
              {player.number}
            </span>
          ) : null}
        </div>

        <div aria-hidden="true" className="bg-fg-secondary my-[10px] w-px shrink-0" />

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 pr-3 pl-4">
          <h3 className="text-fg-secondary font-sans text-[20px] leading-none font-bold uppercase italic">
            {player.name}
          </h3>
          {position ? (
            <p className="label-italic text-position text-[10px] uppercase">{position}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
