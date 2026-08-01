import { unstable_cache } from "next/cache";

import type { Sponsor } from "@payload-types";

import { CACHE_TTL_SECONDS, getPayloadClient } from "./payload";

async function fetchSponsors(limit: number): Promise<Sponsor[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "sponsors",
    sort: "sortOrder",
    limit,
    depth: 1,
  });
  return result.docs;
}

/** All sponsors in editor-defined order. */
export async function getSponsors(limit = 50): Promise<Sponsor[]> {
  const cached = unstable_cache(fetchSponsors, ["sponsors-all", String(limit)], {
    tags: ["sponsors"],
    revalidate: CACHE_TTL_SECONDS,
  });
  return cached(limit);
}
