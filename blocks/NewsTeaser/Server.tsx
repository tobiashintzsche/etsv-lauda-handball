import type { NewsTeaserBlock } from "@payload-types";

import { getNewsList } from "@/lib/news";

import { NewsTeaser } from "./Component";

type NewsTeaserServerProps = {
  block: NewsTeaserBlock;
  isFirst?: boolean;
};

/** Anzahl Karten, auf die das Design ausgelegt ist. */
const DEFAULT_LIMIT = 4;

/**
 * Holt die neuesten Beitraege fuer den News-Teaser.
 *
 * Ist am Block eine Mannschaft hinterlegt, werden nur deren Beitraege gezeigt
 * (Teamseiten). Ohne Treffer verschwindet der Abschnitt komplett — eine leere
 * Ueberschrift ohne Karten sieht nach einem Fehler aus.
 */
export async function NewsTeaserServer({ block, isFirst }: NewsTeaserServerProps) {
  const teamId = typeof block.team === "object" && block.team !== null ? block.team.id : block.team;

  const { docs } = await getNewsList({
    limit: block.limit ?? DEFAULT_LIMIT,
    ...(teamId ? { teamId } : {}),
  });

  if (!docs.length) return null;

  return <NewsTeaser block={block} news={docs} isFirst={isFirst} />;
}
