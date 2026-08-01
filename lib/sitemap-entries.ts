import { unstable_cache } from "next/cache";

import type { Where } from "payload";

import { CACHE_TTL_SECONDS, getPayloadClient, publishedNewsWhere } from "./payload";

/** Collections that own a public detail route and therefore belong in the sitemap. */
export type IndexableCollection = "pages" | "news" | "teams";

export type SitemapEntry = {
  slug: string;
  /** `updatedAt` des Dokuments — nur gesetzt, wenn es ein echtes Datum gibt. */
  updatedAt: string | null;
};

/** Shape we actually read — `select` trims the query down to these fields. */
type IndexableDoc = {
  slug?: string | null;
  updatedAt?: string | null;
  meta?: { noindex?: boolean | null } | null;
};

/**
 * Publish gate per collection. Teams have no draft workflow, so everything
 * that exists is public.
 */
function publishedWhere(collection: IndexableCollection): Where | undefined {
  switch (collection) {
    case "news":
      return publishedNewsWhere();
    case "pages":
      return { _status: { equals: "published" } };
    default:
      return undefined;
  }
}

async function fetchIndexable(collection: IndexableCollection): Promise<SitemapEntry[]> {
  const payload = await getPayloadClient();
  const where = publishedWhere(collection);

  const result = await payload.find({
    collection,
    depth: 0,
    pagination: false,
    ...(where && { where }),
    select: { slug: true, updatedAt: true, meta: true },
  });

  return (result.docs as unknown as IndexableDoc[])
    .filter((doc): doc is IndexableDoc & { slug: string } => {
      // noindex heisst: erreichbar, aber nicht in der Sitemap. Sonst laedt man
      // Suchmaschinen ausdruecklich zu einer Seite ein, die sie ignorieren sollen.
      return Boolean(doc.slug) && !doc.meta?.noindex;
    })
    .map((doc) => ({ slug: doc.slug, updatedAt: doc.updatedAt ?? null }));
}

/**
 * Indexierbare Dokumente einer Collection mit Aenderungsdatum.
 *
 * Eigener Loader statt der Slug-Loader aus `lib/pages.ts` und Co.: die Sitemap
 * braucht zusaetzlich `updatedAt` und das `noindex`-Flag, alles andere waere
 * unnoetiger Ballast in einer Abfrage, die ueber alle Beitraege laeuft.
 */
export async function getIndexableEntries(
  collection: IndexableCollection,
): Promise<SitemapEntry[]> {
  const cached = unstable_cache(fetchIndexable, ["sitemap-entries", collection], {
    tags: [collection],
    revalidate: CACHE_TTL_SECONDS,
  });
  return cached(collection);
}
