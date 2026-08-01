import type { FixtureTable } from "../types";
import gdBk1 from "./gd-bk-1-nf.json";
import gdQbB3 from "./gd-qb-b3-nf.json";
import m2Bk1 from "./m-2bk-1-nf.json";
import mbBk from "./mb-bk-nf.json";
import mcQb2 from "./mc-qb-2-nf.json";
import mcQb13 from "./mc-qb-13-nf.json";
import waBl from "./wa-bl-nf.json";
import waQb1 from "./wa-qb-1-nf.json";
import wbBl1 from "./wb-bl-1-nf.json";
import wcQb2 from "./wc-qb-2-nf.json";
import wdBk1 from "./wd-bk-1-nf.json";

/**
 * Closing tables of season 2025/26, pulled from the handball.net API once and
 * frozen as JSON.
 *
 * Why they exist: season 2026/27 starts in September 2026 and delivers empty
 * rows until then. Without a fallback every table on the site would be an
 * empty state for months. These files let the page show the real, finished
 * table instead — clearly labelled as last season's.
 *
 * `aliases` carries every id that should resolve to a table: the 2025/26
 * tournament and team id plus, where the squad still exists, its 2026/27
 * successors. Team ids change every season, `teamGroupId` is what stays
 * stable — the mapping was resolved through it when these files were built.
 */
export const FIXTURE_TABLES: FixtureTable[] = [
  m2Bk1,
  mbBk,
  mcQb13,
  mcQb2,
  waBl,
  waQb1,
  wbBl1,
  wcQb2,
  wdBk1,
  gdBk1,
  gdQbB3,
];

const BY_ALIAS = new Map<string, FixtureTable>();
for (const table of FIXTURE_TABLES) {
  for (const alias of table.aliases) {
    if (!BY_ALIAS.has(alias)) BY_ALIAS.set(alias, table);
  }
}

/**
 * First archived table matching any of the given ids (tournament id, team id,
 * either season). Ids are tried in order, so pass the most specific first.
 */
export function findFixtureTable(...ids: (string | null | undefined)[]): FixtureTable | null {
  for (const id of ids) {
    if (!id) continue;
    const match = BY_ALIAS.get(id);
    if (match) return match;
  }
  return null;
}
