/**
 * Creates the structural minimum the site needs to render: the "home" page,
 * the news categories and the six teams of the 2026/27 season.
 *
 * NOT editorial content — no news posts, no photos, no player squads. Those
 * come from the content seed (see CLAUDE.md → Phase B).
 *
 * Usage:  pnpm seed:baseline
 * Idempotent: existing docs are matched by slug and left alone.
 */
import type { Payload } from "payload";

const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

/** Team IDs verified against handball.net for the 2026/27 season. */
const TEAMS = [
  {
    name: "Männer",
    slug: "maenner",
    liga: "Bezirksklasse Gruppe 1",
    teamId: "handball4all.baden-wuerttemberg.1451711",
    tournamentId: "handball4all.baden-wuerttemberg.m-bk-1-nf_nf",
    sortOrder: 10,
  },
  {
    name: "männl. B-Jugend",
    slug: "maennl-b-jugend",
    liga: "Bezirksklasse Gruppe 2",
    teamId: "handball4all.baden-wuerttemberg.1486571",
    tournamentId: "handball4all.baden-wuerttemberg.mb-bk-2-nf_nf",
    sortOrder: 20,
  },
  {
    name: "männl. C-Jugend",
    slug: "maennl-c-jugend",
    liga: "Bezirksliga",
    teamId: "handball4all.baden-wuerttemberg.1486231",
    tournamentId: "handball4all.baden-wuerttemberg.mc-bl-nf_nf",
    sortOrder: 30,
  },
  {
    name: "weibl. A-Jugend",
    slug: "weibl-a-jugend",
    liga: "Bezirksliga",
    teamId: "handball4all.baden-wuerttemberg.1484316",
    tournamentId: "handball4all.baden-wuerttemberg.wa-bl-nf_nf",
    sortOrder: 40,
  },
  {
    name: "weibl. C-Jugend",
    slug: "weibl-c-jugend",
    liga: "Bezirksklasse Gruppe 2",
    teamId: "handball4all.baden-wuerttemberg.1486526",
    tournamentId: "handball4all.baden-wuerttemberg.wc-bk-2-nf_nf",
    sortOrder: 50,
  },
  {
    name: "gemischte D-Jugend",
    slug: "gemischte-d-jugend",
    liga: "Bezirksklasse Gruppe 4",
    teamId: "handball4all.baden-wuerttemberg.1492381",
    tournamentId: "handball4all.baden-wuerttemberg.gd-bk-4-nf_nf",
    sortOrder: 60,
  },
] as const;

const CATEGORIES = [
  { name: "Spielbericht", slug: "spielbericht", sortOrder: 10 },
  { name: "Vereinsnachricht", slug: "vereinsnachricht", sortOrder: 20 },
  { name: "Jugend", slug: "jugend", sortOrder: 30 },
  { name: "Termine", slug: "termine", sortOrder: 40 },
  { name: "Events", slug: "events", sortOrder: 50 },
] as const;

type SeedCollection = "pages" | "teams" | "newsCategories";

/** True when a doc with that slug already exists. */
async function existsBySlug(
  payload: Payload,
  collection: SeedCollection,
  slug: string,
): Promise<boolean> {
  const result = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  });
  return result.docs.length > 0;
}

/**
 * Bulk-write options shared by every create below. `disableRevalidate` keeps
 * the seed from firing one cache purge per document — see CLAUDE.md for why a
 * running dev server needs a restart afterwards.
 */
const WRITE_OPTS = {
  overrideAccess: true,
  context: { disableRevalidate: true },
} as const;

async function main() {
  // Dynamic import: Payload reads process.env at module load, so it must not
  // be hoisted above the env setup that `node --env-file` performs.
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  let created = 0;
  let skipped = 0;
  const track = (didCreate: boolean, label: string) => {
    if (didCreate) {
      created++;
      console.log(green(`  ✓ ${label}`));
    } else {
      skipped++;
      console.log(dim(`  · ${label} (existiert)`));
    }
  };

  console.log("\nStartseite");
  if (await existsBySlug(payload, "pages", "home")) {
    track(false, "home");
  } else {
    await payload.create({
      collection: "pages",
      data: { title: "ETSV Lauda Handball", slug: "home", _status: "published", layout: [] },
      ...WRITE_OPTS,
    });
    track(true, "home");
  }

  console.log("\nNews-Kategorien");
  for (const category of CATEGORIES) {
    if (await existsBySlug(payload, "newsCategories", category.slug)) {
      track(false, category.name);
      continue;
    }
    await payload.create({
      collection: "newsCategories",
      data: { name: category.name, slug: category.slug, sortOrder: category.sortOrder },
      ...WRITE_OPTS,
    });
    track(true, category.name);
  }

  console.log("\nMannschaften");
  for (const team of TEAMS) {
    const label = `${team.name} (${team.liga})`;
    if (await existsBySlug(payload, "teams", team.slug)) {
      track(false, label);
      continue;
    }
    await payload.create({
      collection: "teams",
      data: {
        name: team.name,
        slug: team.slug,
        liga: team.liga,
        sortOrder: team.sortOrder,
        showNextGames: true,
        showTable: true,
        handballNet: { teamId: team.teamId, tournamentId: team.tournamentId },
      },
      ...WRITE_OPTS,
    });
    track(true, label);
  }

  console.log(`\n${green(`${created} angelegt`)}, ${yellow(`${skipped} uebersprungen`)}\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
