import type { SponsorsBlock } from "@payload-types";

import { getSponsors } from "@/lib/sponsors";

import { Sponsors } from "./Component";

type SponsorsServerProps = {
  block: SponsorsBlock;
  isFirst?: boolean;
};

/**
 * Laedt die Sponsoren fuer den Block. Ohne Eintraege verschwindet der Abschnitt —
 * eine leere Sponsorenflaeche ist schlechter als gar keine.
 */
export async function SponsorsServer({ block, isFirst }: SponsorsServerProps) {
  const sponsors = await getSponsors(block.limit ?? undefined);

  if (!sponsors.length) return null;

  return <Sponsors block={block} sponsors={sponsors} isFirst={isFirst} />;
}
