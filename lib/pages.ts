import { unstable_cache } from "next/cache";

import type { Page } from "@payload-types";

import { CACHE_TTL_SECONDS, getPayloadClient } from "./payload";

async function fetchPage(slug: string): Promise<Page | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  });
  return result.docs[0] ?? null;
}

/**
 * Loads a page by slug.
 *
 * Tags `pages` and `pages-<slug>` are purged by the collection hooks, so an
 * edit is live on the next request. Draft mode bypasses the cache entirely —
 * the live preview must never serve a stale entry.
 */
export async function getPageBySlug(slug: string, draft = false): Promise<Page | null> {
  if (draft) {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "pages",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
      draft: true,
    });
    return result.docs[0] ?? null;
  }

  const cached = unstable_cache(fetchPage, ["pages-by-slug", slug], {
    tags: ["pages", `pages-${slug}`],
    revalidate: CACHE_TTL_SECONDS,
  });
  return cached(slug);
}

async function fetchPageSlugs(): Promise<string[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "pages",
    where: { _status: { equals: "published" } },
    limit: 500,
    depth: 0,
    select: { slug: true },
  });
  return result.docs.map((d) => d.slug).filter(Boolean);
}

/** All published page slugs — for generateStaticParams and the sitemap. */
export async function getPageSlugs(): Promise<string[]> {
  const cached = unstable_cache(fetchPageSlugs, ["pages-slugs"], {
    tags: ["pages"],
    revalidate: CACHE_TTL_SECONDS,
  });
  return cached();
}
