import { revalidateTag } from "next/cache";

import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from "payload";

/**
 * Hook factories that invalidate Next.js cache tags after a Payload write.
 *
 * The loaders in `lib/*.ts` wrap every read in `unstable_cache` with the tags
 * `<collection>` and `<collection>-<slug>`. These hooks purge them so an edit
 * in the admin is live on the next request instead of after the fallback TTL.
 *
 * Every hook swallows its own errors: a failed cache purge must never break
 * the editor's save.
 */

type SlugGetter<T> = (doc: T) => string | null | undefined;

function purge(tags: readonly string[]): void {
  for (const tag of tags) {
    // `expire: 0` — sofort abgelaufen, kein Stale-While-Revalidate-Fenster.
    revalidateTag(tag, { expire: 0 });
  }
}

/**
 * afterChange hook for collections.
 *
 *   hooks: {
 *     afterChange: [revalidateCollection<NewsDoc>("news", (d) => d.slug)],
 *   }
 */
export function revalidateCollection<T extends { id: string | number } = { id: string | number }>(
  collectionTag: string,
  slugGetter?: SlugGetter<T>,
): CollectionAfterChangeHook {
  return async ({ doc, req, context }) => {
    if (context?.disableRevalidate) return doc;

    try {
      const slug = slugGetter?.(doc as T);
      purge(slug ? [collectionTag, `${collectionTag}-${slug}`] : [collectionTag]);
      req.payload.logger.info(
        `[revalidate] ${collectionTag}${slug ? `, ${collectionTag}-${slug}` : ""}`,
      );
    } catch (err) {
      req.payload.logger.error({ err }, `[revalidate] ${collectionTag} failed`);
    }

    return doc;
  };
}

/** afterDelete counterpart — same tags, so removed docs disappear immediately. */
export function revalidateCollectionDelete<
  T extends { id: string | number } = { id: string | number },
>(collectionTag: string, slugGetter?: SlugGetter<T>): CollectionAfterDeleteHook {
  return async ({ doc, req, context }) => {
    if (context?.disableRevalidate) return doc;

    try {
      const slug = slugGetter?.(doc as T);
      purge(slug ? [collectionTag, `${collectionTag}-${slug}`] : [collectionTag]);
      req.payload.logger.info(
        `[revalidate-delete] ${collectionTag}${slug ? `, ${collectionTag}-${slug}` : ""}`,
      );
    } catch (err) {
      req.payload.logger.error({ err }, `[revalidate-delete] ${collectionTag} failed`);
    }

    return doc;
  };
}

/**
 * afterChange hook that purges a fixed list of tags.
 *
 * For collections whose documents carry no tag of their own but are
 * depth-populated into other loaders' results — `media` is the case: an image
 * lives inside the cached `news`, `teams`, `pages`, … entries, so a swapped
 * file or a corrected alt text has to purge the *consumers*.
 */
export function revalidateTags(tags: readonly string[]): CollectionAfterChangeHook {
  return async ({ doc, req, context }) => {
    if (context?.disableRevalidate) return doc;

    try {
      purge(tags);
      req.payload.logger.info(`[revalidate] ${tags.join(", ")}`);
    } catch (err) {
      req.payload.logger.error({ err }, `[revalidate] ${tags.join(", ")} failed`);
    }

    return doc;
  };
}

/** afterDelete counterpart to `revalidateTags`. */
export function revalidateTagsDelete(tags: readonly string[]): CollectionAfterDeleteHook {
  return async ({ doc, req, context }) => {
    if (context?.disableRevalidate) return doc;

    try {
      purge(tags);
      req.payload.logger.info(`[revalidate-delete] ${tags.join(", ")}`);
    } catch (err) {
      req.payload.logger.error({ err }, `[revalidate-delete] ${tags.join(", ")} failed`);
    }

    return doc;
  };
}

/** afterChange hook for globals. Globals have no slug — one tag is enough. */
export function revalidateGlobal(tag: string): GlobalAfterChangeHook {
  return async ({ doc, req, context }) => {
    if (context?.disableRevalidate) return doc;

    try {
      purge([tag]);
      req.payload.logger.info(`[revalidate] global:${tag}`);
    } catch (err) {
      req.payload.logger.error({ err }, `[revalidate] global:${tag} failed`);
    }

    return doc;
  };
}
