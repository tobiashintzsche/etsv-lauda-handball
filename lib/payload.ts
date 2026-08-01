import { type Where, getPayload } from "payload";

import config from "@payload-config";

/**
 * Shared Payload instance accessor. Every loader goes through this so there is
 * exactly one place importing the config.
 *
 * `getPayload` memoises internally — calling it per request is cheap.
 */
export function getPayloadClient() {
  return getPayload({ config });
}

/** Fallback TTL for cached reads. Writes purge the tags long before this. */
export const CACHE_TTL_SECONDS = 60 * 60;

/**
 * Publish gate shared by every public News query: the doc must be published
 * AND its publish date must not be in the future.
 */
export function publishedNewsWhere(): Where {
  return {
    and: [
      { _status: { equals: "published" } },
      { publishedAt: { less_than_equal: new Date().toISOString() } },
    ],
  };
}
