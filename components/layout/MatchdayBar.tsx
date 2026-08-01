import type { Game } from "@payload-types";

import { getHighlightBanner, getSiteSettings } from "@/lib/globals";
import { isPopulated } from "@/lib/utils";

import { MatchdayEvent } from "./MatchdayEvent";
import { MatchdayGame } from "./MatchdayGame";

/**
 * Die weisse Leiste unter dem Header (Global `highlight-banner`).
 *
 * Wird NICHT im Layout gerendert, sondern von der Startseite direkt unter dem
 * Header — sie gehoert inhaltlich zur Seite, nicht zum Rahmen. Ist die Leiste
 * abgeschaltet oder fehlt der Inhalt, kommt nichts zurueck.
 */
export async function MatchdayBar() {
  const banner = await getHighlightBanner();
  if (!banner.active) return null;

  if (banner.type === "event") {
    return banner.event?.headline ? <MatchdayEvent event={banner.event} /> : null;
  }

  const game = isPopulated<Game>(banner.game) ? banner.game : null;
  if (!game) return null;

  const settings = await getSiteSettings();
  return <MatchdayGame game={game} clubName={settings.siteName} />;
}
