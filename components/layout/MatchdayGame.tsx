import Image from "next/image";
import Link from "next/link";

import type { Game } from "@payload-types";

import { ArrowRightIcon } from "@/components/icons";
import { ClubCrest } from "@/components/teams/ClubCrest";
import { formatGameDate } from "@/lib/format";
import { findClubLogoUrl } from "@/lib/handball/opponent-logos";
import { ROUTES } from "@/lib/paths";
import { strings } from "@/lib/strings";
import { CONTAINER, cn, isMedia } from "@/lib/utils";

type Side = {
  name: string;
  /** Gegnerwappen: Mediathek-Upload, sonst handball.net-Map, sonst Initialen. */
  logoUrl: string | null;
  /** Unsere Seite — traegt immer den Baerenkopf. */
  isClub: boolean;
};

type MatchdayGameProps = {
  game: Game;
  /** Aus `site-settings.siteName` — nie fest im JSX. */
  clubName: string;
};

/**
 * Spiel-Variante der Matchday-Leiste: Datum, beide Mannschaften mit Wappen,
 * Endstand und der Sprung in die Spieluebersicht.
 *
 * Die Heimmannschaft steht links, damit sich der Stand wie ueberall im
 * Handball liest (Heim:Gast) — bei einem Auswaertsspiel wechseln wir also die
 * Seite und drehen das Ergebnis mit.
 */
export function MatchdayGame({ game, clubName }: MatchdayGameProps) {
  const isHomeGame = game.homeAway === "home";
  const uploadedLogo = isMedia(game.opponentLogo) ? (game.opponentLogo.url ?? null) : null;
  const opponentLogo = uploadedLogo ?? findClubLogoUrl(game.opponent, 80);

  const club: Side = { name: clubName, logoUrl: null, isClub: true };
  const opponent: Side = { name: game.opponent, logoUrl: opponentLogo, isClub: false };
  const home = isHomeGame ? club : opponent;
  const away = isHomeGame ? opponent : club;

  const scoreFor = game.result?.scoreFor;
  const scoreAgainst = game.result?.scoreAgainst;
  const hasResult = typeof scoreFor === "number" && typeof scoreAgainst === "number";
  const score = hasResult
    ? isHomeGame
      ? `${scoreFor}:${scoreAgainst}`
      : `${scoreAgainst}:${scoreFor}`
    : "vs.";

  return (
    <div className="text-fg-secondary bg-white">
      <div
        className={cn(
          CONTAINER,
          "flex flex-col items-center gap-2 py-2",
          "md:flex-row md:justify-between md:gap-6 md:py-4",
        )}
      >
        <p className="text-[14px] md:text-[16px]">{formatGameDate(game.date)}</p>

        <div className="flex w-full items-center justify-between gap-4 md:w-auto md:flex-1 md:justify-center md:gap-5">
          <MatchdaySide side={home} nameFirst />
          <p className={cn("heading-italic shrink-0", hasResult ? "text-[32px]" : "text-[20px]")}>
            {score}
          </p>
          <MatchdaySide side={away} nameFirst={false} />
        </div>

        <Link
          href={ROUTES.schedule}
          className="group hover:text-secondary flex shrink-0 items-center gap-2 border-b-2 border-current pb-0.5 text-[16px] font-bold transition-colors"
        >
          <span>{strings.schedule.title}</span>
          <ArrowRightIcon className="text-secondary transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

/**
 * Eine Mannschaft: Wappen und Name. Auf dem Handy steht das Wappen ueber dem
 * Namen, ab md nebeneinander — aussen der Name, innen das Wappen.
 */
function MatchdaySide({ side, nameFirst }: { side: Side; nameFirst: boolean }) {
  const logo = side.isClub ? (
    <Image
      src="/brand/logo-bear-head.svg"
      alt=""
      width={73}
      height={60}
      unoptimized
      className="h-8 w-auto shrink-0 md:h-10"
    />
  ) : (
    <ClubCrest
      name={side.name}
      logoUrl={side.logoUrl}
      className="h-8 w-8 text-[12px] md:h-10 md:w-10"
    />
  );

  const name = <p className="heading-italic text-center text-[14px] md:text-[16px]">{side.name}</p>;

  return (
    <div
      className={cn(
        "flex flex-1 items-center gap-1 md:flex-none md:flex-row md:gap-2",
        nameFirst ? "flex-col-reverse" : "flex-col",
      )}
    >
      {nameFirst ? name : logo}
      {nameFirst ? logo : name}
    </div>
  );
}
