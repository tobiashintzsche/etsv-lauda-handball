import type { NextGamesBlock, Team } from "@payload-types";

import { getNextGames } from "@/lib/games";
import { isPopulated } from "@/lib/utils";

import { NextGamesSection } from "./Component";

/**
 * Data side of the „Nächste Spiele“ block.
 *
 * With no team selected the block shows the next fixtures of the whole club —
 * that is the variant on the home page. On a team page the relationship is
 * set and narrows it to that squad.
 */
export async function NextGamesServer({ block }: { block: NextGamesBlock }) {
  if (block.active === false) return null;

  const teamId = isPopulated<Team>(block.team) ? block.team.id : (block.team ?? undefined);

  const { home, away } = await getNextGames({
    teamId: teamId ?? undefined,
    maxPerColumn: block.maxPerColumn ?? 3,
  });

  // `sectionBackground` is deliberately not forwarded: the matchday-post look
  // brings its own surface (see `Component.tsx`).
  return (
    <NextGamesSection
      headline={block.headline}
      subline={block.subline}
      home={home}
      away={away}
      anchorId={block.anchorId}
    />
  );
}
