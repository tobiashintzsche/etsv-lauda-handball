import { unstable_cache } from "next/cache";

import type { MatchdayPost } from "@payload-types";

import { CACHE_TTL_SECONDS, getPayloadClient } from "@/lib/payload";

/**
 * Read side of the matchday posts.
 *
 * `overrideAccess: true` on purpose: the collection is editor-only, but the
 * render route has to work from a plain link (that is how the PNG export and
 * the admin preview reach it). Nothing secret is in there — the fixtures are
 * public on the website anyway.
 */

const TAG = "matchdayPosts";

async function fetchPost(id: string): Promise<MatchdayPost | null> {
  const payload = await getPayloadClient();
  try {
    return await payload.findByID({
      collection: "matchdayPosts",
      id,
      depth: 1,
      overrideAccess: true,
    });
  } catch {
    // findByID throws on an unknown id — the route turns null into a 404.
    return null;
  }
}

/** One post by id, or null when it does not exist. */
export async function getMatchdayPost(id: string): Promise<MatchdayPost | null> {
  const cached = unstable_cache(fetchPost, ["matchday-post", id], {
    tags: [TAG, `${TAG}-${id}`],
    revalidate: CACHE_TTL_SECONDS,
  });
  return cached(id);
}

async function fetchPosts(limit: number): Promise<MatchdayPost[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "matchdayPosts",
    sort: "matchday.dateFrom",
    limit,
    depth: 1,
    overrideAccess: true,
  });
  return result.docs;
}

/** All posts, earliest matchday first — for the overview route. */
export async function getMatchdayPosts(limit = 50): Promise<MatchdayPost[]> {
  const cached = unstable_cache(fetchPosts, ["matchday-posts", String(limit)], {
    tags: [TAG],
    revalidate: CACHE_TTL_SECONDS,
  });
  return cached(limit);
}
