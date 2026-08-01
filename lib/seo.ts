import type { SiteSetting } from "@payload-types";

import { getSiteSettings } from "./globals";

/**
 * Site-wide indexing switch, editable under Vereinsdaten → Sichtbarkeit.
 *
 * It takes three layers, because none of them alone does the job: robots.txt
 * keeps crawlers off the site, an empty sitemap stops inviting them in — but
 * only the `noindex` meta tag gets URLs that are already indexed removed again.
 */

/**
 * Pure evaluation of the switch, kept separate so the NULL case is testable.
 *
 * Only an explicit `false` blocks indexing. The migration backfills the column
 * with `true`, so NULL should never reach us — and if it ever does, the site
 * stays visible instead of quietly dropping out of Google. Going dark has to be
 * a deliberate click, never the result of a missing value.
 */
export function indexingAllowed(settings: Pick<SiteSetting, "isIndexable">): boolean {
  return settings.isIndexable !== false;
}

/** Same switch, read through the cached `site-settings` loader. */
export async function isSiteIndexable(): Promise<boolean> {
  return indexingAllowed(await getSiteSettings());
}
