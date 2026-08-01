import type { Payload } from "payload";

import type { ImageKey, MediaMap } from "./images";
import { log } from "./log";
import { Tally, WRITE_OPTS, findFirst } from "./payload-helpers";

/**
 * Four partners. Distelhäuser and b.safe are the real sponsors whose logos ship
 * in `scripts/seed-assets/`; the other two are invented placeholders with a
 * generated wordmark, so the sponsor page has enough rows to alternate.
 */

type SponsorSeed = {
  name: string;
  logo: ImageKey;
  description: string;
  website?: string;
  sortOrder: number;
};

export const SPONSOR_SEEDS: SponsorSeed[] = [
  {
    name: "Distelhäuser Brauerei",
    logo: "sponsorDistelhaeuser",
    description:
      "Die Distelhäuser Brauerei begleitet den Handball in Lauda seit vielen Jahren — " +
      "bei Heimspielen, beim Sommerfest und immer dann, wenn nach dem Schlusspfiff " +
      "noch jemand in der Halle bleibt. Ein Partner aus der Region für einen Verein " +
      "aus der Region.",
    website: "https://www.distelhaeuser.de",
    sortOrder: 10,
  },
  {
    name: "b.safe",
    logo: "sponsorBsafe",
    description:
      "b.safe unterstützt die Handballabteilung bei Trikots und Ausrüstung. Gerade im " +
      "Jugendbereich, wo jedes Jahr neue Sätze gebraucht werden, ist diese " +
      "Partnerschaft ein wichtiger Baustein.",
    sortOrder: 20,
  },
  {
    name: "Autohaus Main-Tauber",
    logo: "sponsorAutohaus",
    description:
      "Das Autohaus Main-Tauber stellt der Abteilung den Mannschaftsbus für " +
      "Auswärtsfahrten und Turniertage. Ohne diese Unterstützung wären weite Fahrten " +
      "in die Nachbarbezirke für die Jugendmannschaften kaum zu stemmen.",
    website: "https://www.autohaus-main-tauber.example",
    sortOrder: 30,
  },
  {
    name: "Elektro Rebholz",
    logo: "sponsorElektro",
    description:
      "Elektro Rebholz aus Lauda-Königshofen fördert seit der Saison 2024/25 die " +
      "Jugendarbeit des ETSV. Der Betrieb finanziert Bälle, Hallenzeiten und die " +
      "Ausbildung neuer Übungsleiterinnen und Übungsleiter.",
    website: "https://www.elektro-rebholz.example",
    sortOrder: 40,
  },
];

export async function seedSponsors(payload: Payload, media: MediaMap): Promise<number> {
  log.step(`Sponsoren (${SPONSOR_SEEDS.length})`);
  const tally = new Tally();

  for (const seed of SPONSOR_SEEDS) {
    const logo = media.get(seed.logo);
    if (!logo) throw new Error(`Sponsorenlogo "${seed.logo}" fehlt`);

    const data = {
      name: seed.name,
      logo,
      description: seed.description,
      website: seed.website ?? null,
      sortOrder: seed.sortOrder,
    };

    const existing = await findFirst(payload, "sponsors", { name: { equals: seed.name } });
    if (existing) {
      await payload.update({ collection: "sponsors", id: existing.id, data, ...WRITE_OPTS });
      tally.add(false);
    } else {
      await payload.create({ collection: "sponsors", data, ...WRITE_OPTS });
      tally.add(true);
    }
    log.ok(seed.name);
  }

  log.info(tally.summary);
  return SPONSOR_SEEDS.length;
}
