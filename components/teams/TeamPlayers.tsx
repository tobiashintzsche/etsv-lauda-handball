import type { Player } from "@payload-types";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionShell } from "@/components/ui/SectionShell";
import { strings } from "@/lib/strings";

import { PlayerCard } from "./PlayerCard";

type TeamPlayersProps = {
  players: Player[];
};

/**
 * „Unsere Spieler“ — the squad as a horizontal card track.
 *
 * The track is not a mobile-only concession: four 263px cards are wider than
 * the 992px container, so the last card is cut off on the desktop too. That
 * bleed is the design's cue that the row scrolls (design 2.2).
 */
export function TeamPlayers({ players }: TeamPlayersProps) {
  return (
    <SectionShell background="backgroundDark">
      <SectionHeader headline={strings.teams.playersHeadline} />

      {players.length === 0 ? (
        <p className="text-muted mt-6 text-[14px] leading-[1.5] md:text-[16px]">
          {strings.teams.noPlayers}
        </p>
      ) : (
        <div className="scroll-track mt-6">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </SectionShell>
  );
}
