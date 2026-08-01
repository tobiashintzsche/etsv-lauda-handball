import type { CollectionSlug, DataFromCollectionSlug, Payload, Where } from "payload";

/**
 * Write options shared by every create/update in the demo seed.
 *
 * `disableRevalidate` keeps the seed from firing one cache purge per document
 * — see CLAUDE.md for why a running dev server needs a restart afterwards.
 */
export const WRITE_OPTS = {
  overrideAccess: true,
  context: { disableRevalidate: true },
} as const;

/** First match or null — the building block of every upsert below. */
export async function findFirst<TSlug extends CollectionSlug>(
  payload: Payload,
  collection: TSlug,
  where: Where,
): Promise<DataFromCollectionSlug<TSlug> | null> {
  const result = await payload.find({
    collection,
    where,
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  return result.docs[0] ?? null;
}

/** Counts how often the seed created versus updated a document. */
export class Tally {
  created = 0;
  updated = 0;

  add(didCreate: boolean): void {
    if (didCreate) this.created++;
    else this.updated++;
  }

  get summary(): string {
    return `${this.created} neu, ${this.updated} aktualisiert`;
  }
}

/** Date of a day `days` before now, as an ISO string. */
export function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}
