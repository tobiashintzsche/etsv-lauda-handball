import { unstable_cache } from "next/cache";

import type { Footer, HighlightBanner, Navigation, SiteSetting } from "@payload-types";

import { CACHE_TTL_SECONDS, getPayloadClient } from "./payload";

/**
 * Loaders for the four Payload globals. Each has its own cache tag, purged by
 * the matching `revalidateGlobal` hook.
 */

async function fetchSiteSettings(): Promise<SiteSetting> {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "site-settings", depth: 1 });
}

export async function getSiteSettings(): Promise<SiteSetting> {
  const cached = unstable_cache(fetchSiteSettings, ["site-settings"], {
    tags: ["site-settings"],
    revalidate: CACHE_TTL_SECONDS,
  });
  return cached();
}

async function fetchNavigation(): Promise<Navigation> {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "navigation", depth: 2 });
}

export async function getNavigation(): Promise<Navigation> {
  const cached = unstable_cache(fetchNavigation, ["navigation"], {
    tags: ["navigation"],
    revalidate: CACHE_TTL_SECONDS,
  });
  return cached();
}

async function fetchFooter(): Promise<Footer> {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "footer", depth: 2 });
}

export async function getFooter(): Promise<Footer> {
  const cached = unstable_cache(fetchFooter, ["footer"], {
    tags: ["footer"],
    revalidate: CACHE_TTL_SECONDS,
  });
  return cached();
}

async function fetchHighlightBanner(): Promise<HighlightBanner> {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "highlight-banner", depth: 2 });
}

export async function getHighlightBanner(): Promise<HighlightBanner> {
  const cached = unstable_cache(fetchHighlightBanner, ["highlight-banner"], {
    tags: ["highlight-banner", "games"],
    revalidate: CACHE_TTL_SECONDS,
  });
  return cached();
}
