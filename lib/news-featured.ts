/**
 * Ordering rule for the hero slider: featured posts first, newest after.
 *
 * `getNewsList` can filter by `featured` but always sorts by `-publishedAt` —
 * there is no single query that returns "featured first, then the rest". The
 * hero therefore runs two queries and stitches the results together here.
 *
 * Kept free of Payload and Next imports so it stays a plain, unit-testable
 * function.
 */

type Identifiable = { id: string | number };

/**
 * Concatenates the featured posts and the latest posts, drops duplicates
 * (a featured post is usually also among the newest) and cuts the result to
 * `limit`. Order within each group is preserved.
 */
export function mergeFeaturedFirst<T extends Identifiable>(
  featured: readonly T[],
  latest: readonly T[],
  limit: number,
): T[] {
  if (limit <= 0) return [];

  const seen = new Set<string | number>();
  const merged: T[] = [];

  for (const item of [...featured, ...latest]) {
    if (merged.length >= limit) break;
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }

  return merged;
}
