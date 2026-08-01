/**
 * Editorial demo seed — everything the site needs to look finished.
 *
 * Builds on `pnpm seed:baseline` (home page, news categories, the six teams of
 * the 2026/27 season) and adds: nine enriched teams with photos and training
 * times, 22 players, the real 2025/26 fixtures of the men plus invented
 * 2026/27 fixtures, twelve news articles, four sponsors, four pages and all
 * four globals.
 *
 * Idempotent: every document is matched (slug, filename or team+date) and
 * updated instead of duplicated, so the script can run as often as needed.
 *
 * Usage:
 *   node --env-file=.env --import=tsx/esm scripts/seed-demo.ts
 *   node --env-file=.env --import=tsx/esm scripts/seed-demo.ts --media-only
 *   node --env-file=.env --import=tsx/esm scripts/seed-demo.ts --skip-media
 *
 * Requires the baseline seed and an applied migration state. The script writes
 * with `context: { disableRevalidate: true }`, so a running dev server keeps
 * serving cached (empty) loader results until it is restarted.
 */
import type { Payload } from "payload";

import { findBannerGame, seedGames } from "./seed-demo/content-games";
import { seedNews } from "./seed-demo/content-news";
import { seedGlobals, seedPages } from "./seed-demo/content-site";
import { seedSponsors } from "./seed-demo/content-sponsors";
import { seedPlayers, seedTeams } from "./seed-demo/content-teams";
import { type MediaMap, seedMedia } from "./seed-demo/images";
import { log } from "./seed-demo/log";
import { findFirst } from "./seed-demo/payload-helpers";

const flags = new Set(process.argv.slice(2));
const MEDIA_ONLY = flags.has("--media-only");
const SKIP_MEDIA = flags.has("--skip-media");

/** The five categories the baseline seed created — resolved by slug. */
const CATEGORY_SLUGS = ["spielbericht", "vereinsnachricht", "jugend", "termine", "events"];

async function main() {
  // Dynamic import: Payload reads process.env at module load, so it must not be
  // hoisted above the env setup that `node --env-file` performs.
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  const started = Date.now();
  log.step("ETSV Lauda — Demo-Inhalte");

  const media: MediaMap = SKIP_MEDIA ? new Map() : await seedMedia(payload);
  if (MEDIA_ONLY) {
    log.info("--media-only: fertig");
    process.exit(0);
  }
  if (SKIP_MEDIA) log.warn("--skip-media: Bilder werden nicht neu verknüpft");

  const teams = await seedTeams(payload, media);
  await seedPlayers(payload, media, teams);
  await seedGames(payload, teams);

  const categories = new Map<string, number>();
  for (const slug of CATEGORY_SLUGS) {
    const doc = await findFirst(payload, "newsCategories", { slug: { equals: slug } });
    if (doc) categories.set(slug, doc.id);
    else log.warn(`News-Kategorie "${slug}" fehlt — bitte zuerst pnpm seed:baseline ausführen`);
  }

  await seedNews(payload, media, teams, categories);
  await seedSponsors(payload, media);

  const pages = await seedPages(payload, media, teams);
  const bannerGameId = await findBannerGame(payload, teams);
  await seedGlobals(payload, media, teams, pages, bannerGameId);

  await report(payload, started);
  process.exit(0);
}

/** Counts what is actually in the database — the proof, not the intention. */
async function report(payload: Payload, started: number) {
  log.step("Bestand");
  const counts = await Promise.all(
    (["teams", "players", "games", "news", "sponsors", "media", "pages"] as const).map(
      async (collection) => {
        const result = await payload.count({ collection, overrideAccess: true });
        return `${collection}: ${result.totalDocs}`;
      },
    ),
  );
  for (const line of counts) log.ok(line);
  log.info(`Dauer: ${Math.round((Date.now() - started) / 1000)}s`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
