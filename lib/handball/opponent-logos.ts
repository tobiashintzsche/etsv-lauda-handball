import { resolveLogoUrl } from "./logo";

/**
 * What we know about a club when all we have is its name.
 *
 * Live handball.net responses ship a crest with every team object. Fixtures
 * from our own `games` collection do not — an editor types "SG Gundelsheim"
 * into a text field and that is all we get. This module closes that gap: the
 * names below were pulled from the same handball.net dataset the seed uses, so
 * an editor-entered opponent resolves to the very same crest the API would
 * have delivered.
 *
 * Frozen on purpose. A club changes its crest maybe once a decade; a network
 * round trip per fixture card to find that out would be absurd.
 */

/** Crests render at 24px; ask handball.net for a small variant. */
const DEFAULT_LOGO_WIDTH = 48;

/** Matches "ETSV Lauda", "ETSV Lauda 2", "ETSV Lauda Handball", … */
const OWN_CLUB_PATTERN = /lauda/i;

/**
 * Second-chance lookup: a trailing 1–2 digit number is a team counter
 * ("HSG Hohenlohe 3"), not part of the club name — those teams share one
 * crest. Longer numbers are founding years ("TV Hardheim 1895") and stay.
 */
const TEAM_NUMBER_SUFFIX = /\s\d{1,2}$/;

/**
 * Every club ETSV Lauda played in 2025/26, plus our own — crest as the
 * handball.net pseudo URI, exactly as the API returns it.
 *
 * Keyed by the club name as handball.net spells it. The lookup normalises, so
 * casing and punctuation do not have to match; keeping the readable spelling
 * here means a volunteer can check an entry against the handball.net page.
 */
const CLUB_LOGOS: Record<string, string> = {
  "ETSV Lauda": "handball-net:files/migration/V20210907/H4A_26005_Baden_Lauda.svg",
  "HB Ludwigsburg": "handball-net:files/clubs/logos/4acb2518-e601-4f38-9888-e1892f55ba90.png",
  "HC Metter-Enz": "handball-net:files/clubs/logos/37d21845-8e6e-45dc-8cbc-bcd2a68abef9.png",
  "HC Metter-Enz 2": "handball-net:files/clubs/logos/37d21845-8e6e-45dc-8cbc-bcd2a68abef9.png",
  "HSG Hohenlohe": "handball-net:files/clubs/logos/ff5f0ac1-8b23-464c-89ff-d7d368fb3ffa.jpeg",
  "HSG Hohenlohe 2": "handball-net:files/clubs/logos/ff5f0ac1-8b23-464c-89ff-d7d368fb3ffa.jpeg",
  "HSG Hohenlohe 3": "handball-net:files/clubs/logos/ff5f0ac1-8b23-464c-89ff-d7d368fb3ffa.jpeg",
  "HSG Kochertürn/Stein 2":
    "handball-net:files/clubs/logos/4ff6f414-360f-4c80-ad58-edd01c2d9421.png",
  "HSG Lauffen-Neipperg":
    "handball-net:files/clubs/logos/0fd894f0-fa23-4111-801b-48fdfec2c9ce.jpeg",
  "HSG Leudelsbach": "handball-net:files/clubs/logos/a6968a37-2ca3-4d27-92b1-d9121357decf.jpeg",
  "HSG Marbach-Rielingshausen":
    "handball-net:files/clubs/logos/416380af-09e9-49f7-9a5a-dd50a3ceefcf.png",
  "HSG Staufer Bad Wimpfen/Biberach":
    "handball-net:files/clubs/logos/61962794-34d1-4266-9606-e589732eed28.png",
  "HSG Staufer Bad Wimpfen/Biberach 2":
    "handball-net:files/clubs/logos/61962794-34d1-4266-9606-e589732eed28.png",
  "JHFH Jugendhandball Flein-Horkheim":
    "handball-net:files/clubs/logos/4a00578f-264d-489e-b92c-f329f98e7d30.jpeg",
  "JSG Kochertal": "handball-net:files/clubs/logos/2e4d2a53-d12d-4d04-883d-9dbcb9c98584.png",
  "JSG Neckarelz-Obrigheim":
    "handball-net:files/clubs/logos/cd13a49c-37d9-4638-8a06-9c17624bf400.png",
  "JSG Tauberfranken": "handball-net:files/clubs/logos/032fde5e-eb08-45c8-9658-da595bedfe3c.jpeg",
  "JSG Tauberfranken 2": "handball-net:files/clubs/logos/032fde5e-eb08-45c8-9658-da595bedfe3c.jpeg",
  "JSG Taubertal": "handball-net:files/clubs/logos/8f53d0ca-e92a-4982-8442-d4ce9b8fe446.jpeg",
  "SC Züttlingen": "handball-net:files/migration/V20210907/H4A_470_Wuerttemberg_Zuettlingen.jpg",
  "SG Bad Mergentheim": "handball-net:files/clubs/logos/b4b1c49c-69f1-49b2-86a0-836b4983927b.png",
  "SG Degmarn-Oedheim 2": "handball-net:files/clubs/logos/b70b524b-884b-41d6-872f-82c535d0a1ab.png",
  "SG Gundelsheim": "handball-net:files/migration/V20210907/H4A_437_Wuerttemberg_Gundelsheim.jpg",
  "SG Heuchelberg 2": "handball-net:files/clubs/logos/be48cb1e-f7f1-4abe-93b5-0c0648fcbba2.jpeg",
  "SG Heuchelberg 3": "handball-net:files/clubs/logos/be48cb1e-f7f1-4abe-93b5-0c0648fcbba2.jpeg",
  "SpG Walldürn": "handball-net:files/clubs/logos/5bab09d7-ee97-4266-a7e0-4fd4e2a6f98a.png",
  "Sport-Union Neckarsulm 2":
    "handball-net:files/clubs/logos/b9302fdc-28fb-4706-bcc7-8a2fe39519dd.png",
  "TB Richen": "handball-net:files/clubs/logos/2ea6bcc2-ff0e-407f-b420-610d99c27074.png",
  "TB Richen 2": "handball-net:files/clubs/logos/2ea6bcc2-ff0e-407f-b420-610d99c27074.png",
  "TSV 1863 Buchen": "handball-net:files/migration/V20210907/H4A_26008_Baden_Buchen.jpg",
  "TSV 1863 Buchen 2": "handball-net:files/migration/V20210907/H4A_26008_Baden_Buchen.jpg",
  "TSV 1866 Weinsberg": "handball-net:files/clubs/logos/5aaba13d-31c2-4d6b-a6b2-43b9f6695849.jpeg",
  "TSV Bönnigheim": "handball-net:files/clubs/logos/0231334e-52ba-4911-8d9a-0c15f09ffd0b.png",
  "TSV Crailsheim": "handball-net:files/clubs/logos/99f86e6e-a337-4b41-8023-9fc8d6ceb6d0.png",
  "TSV Hardthausen": "handball-net:files/clubs/logos/51cdf789-8dc3-4111-b13a-b7d2fa85b4dc.png",
  "TSV Willsbach": "handball-net:files/clubs/logos/26fe29f2-b0ae-429b-a7ea-2047dcd80af8.png",
  "TV Bad Rappenau": "handball-net:files/clubs/logos/ed693729-410f-4b8b-93ce-33b6da25c7ea.png",
  "TV Bad Rappenau 2": "handball-net:files/clubs/logos/ed693729-410f-4b8b-93ce-33b6da25c7ea.png",
  "TV Hardheim 1895": "handball-net:files/clubs/logos/132eb8aa-4967-44ea-b60e-feafb415099c.png",
  "TV Hardheim 1895 2": "handball-net:files/clubs/logos/132eb8aa-4967-44ea-b60e-feafb415099c.png",
  "TV Mosbach": "handball-net:files/migration/V20210907/H4A_27011_Baden_Mosbach.png",
};

/**
 * Comparable form of a club name.
 *
 * Casing, punctuation and spacing differ between the API, the seed and what an
 * editor types — "HSG Kochertürn/Stein 2" and "HSG Kochertuern / Stein 2" must
 * not be two different clubs. Umlauts stay as they are: the seed data comes
 * from the same source as the map, so folding them would only add a way to be
 * wrong.
 */
export function normalizeClubName(name?: string | null): string {
  if (!name) return "";

  return name
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim();
}

const BY_NORMALIZED_NAME = new Map<string, string>();
for (const [name, logo] of Object.entries(CLUB_LOGOS)) {
  BY_NORMALIZED_NAME.set(normalizeClubName(name), logo);
}

/**
 * Crest of a club by name, or `null` when we have never met them.
 *
 * Tries the exact name first, then the same name without its team counter —
 * "TSV Crailsheim 2" and "TSV Crailsheim" are one club with one crest.
 */
export function findClubLogoUrl(
  name?: string | null,
  width: number = DEFAULT_LOGO_WIDTH,
): string | null {
  const normalized = normalizeClubName(name);
  if (!normalized) return null;

  const logo =
    BY_NORMALIZED_NAME.get(normalized) ??
    BY_NORMALIZED_NAME.get(normalized.replace(TEAM_NUMBER_SUFFIX, ""));

  return logo ? resolveLogoUrl(logo, width) : null;
}

/**
 * Two-letter stand-in for a club without a crest — "SG Gundelsheim" → "SG".
 *
 * German club names almost always open with an abbreviation, so the first
 * letters of the first two words read like a badge rather than noise.
 */
export function clubInitials(name?: string | null): string {
  const letters = normalizeClubName(name)
    .split(" ")
    .map((word) => word[0] ?? "")
    .filter((char) => /\p{Letter}/u.test(char));

  return letters.slice(0, 2).join("").toUpperCase();
}

/** True for every ETSV Lauda squad — their row and their side of a card is highlighted. */
export function isOwnClub(name?: string | null): boolean {
  return OWN_CLUB_PATTERN.test(name ?? "");
}
