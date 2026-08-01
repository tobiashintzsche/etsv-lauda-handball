import { unstable_cache } from "next/cache";

import type { Where } from "payload";

import type { News, NewsCategory } from "@payload-types";

import { mergeFeaturedFirst } from "./news-featured";
import { CACHE_TTL_SECONDS, getPayloadClient, publishedNewsWhere } from "./payload";

export type NewsListResult = {
  docs: News[];
  totalDocs: number;
  totalPages: number;
  page: number;
};

export type NewsListOptions = {
  page?: number;
  limit?: number;
  /** Filter by category slug. */
  category?: string;
  /** Filter by team id — used on team detail pages. */
  teamId?: string | number;
  /** Only featured posts. */
  featured?: boolean;
  /** Exclude one post (e.g. the article currently being read). */
  excludeId?: string | number;
};

async function fetchNewsList(options: NewsListOptions): Promise<NewsListResult> {
  const { page = 1, limit = 12, category, teamId, featured, excludeId } = options;
  const payload = await getPayloadClient();

  const and: Where[] = [publishedNewsWhere()];
  if (category) and.push({ "category.slug": { equals: category } });
  if (teamId) and.push({ team: { equals: teamId } });
  if (featured) and.push({ featured: { equals: true } });
  if (excludeId) and.push({ id: { not_equals: excludeId } });

  const result = await payload.find({
    collection: "news",
    where: { and },
    sort: "-publishedAt",
    page,
    limit,
    depth: 1,
  });

  return {
    docs: result.docs,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page ?? 1,
  };
}

/**
 * Paginated news list. The cache key covers every filter, so the overview page
 * and a team's news strip do not share an entry.
 */
export async function getNewsList(options: NewsListOptions = {}): Promise<NewsListResult> {
  const key = JSON.stringify(options);
  const cached = unstable_cache(fetchNewsList, ["news-list", key], {
    tags: ["news"],
    revalidate: CACHE_TTL_SECONDS,
  });
  return cached(options);
}

/**
 * Slides of the hero slider: the posts the editors marked as „Top-Beitrag“
 * first, topped up with the newest ones.
 *
 * Both halves go through `getNewsList`, so they share its cache entries and its
 * publish gate — only the ordering is done here (see `news-featured.ts`).
 */
export async function getHeroNews(limit: number): Promise<News[]> {
  const [featured, latest] = await Promise.all([
    getNewsList({ featured: true, limit }),
    getNewsList({ limit }),
  ]);
  return mergeFeaturedFirst(featured.docs, latest.docs, limit);
}

async function fetchNewsBySlug(slug: string): Promise<News | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "news",
    where: { and: [publishedNewsWhere(), { slug: { equals: slug } }] },
    limit: 1,
    depth: 2,
  });
  return result.docs[0] ?? null;
}

/** Single news post. Draft mode bypasses both the cache and the publish gate. */
export async function getNewsBySlug(slug: string, draft = false): Promise<News | null> {
  if (draft) {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "news",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
      draft: true,
    });
    return result.docs[0] ?? null;
  }

  const cached = unstable_cache(fetchNewsBySlug, ["news-by-slug", slug], {
    tags: ["news", `news-${slug}`],
    revalidate: CACHE_TTL_SECONDS,
  });
  return cached(slug);
}

async function fetchNewsSlugs(): Promise<string[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "news",
    where: publishedNewsWhere(),
    limit: 1000,
    depth: 0,
    select: { slug: true },
  });
  return result.docs.map((d) => d.slug).filter(Boolean);
}

/** All published news slugs — for generateStaticParams and the sitemap. */
export async function getNewsSlugs(): Promise<string[]> {
  const cached = unstable_cache(fetchNewsSlugs, ["news-slugs"], {
    tags: ["news"],
    revalidate: CACHE_TTL_SECONDS,
  });
  return cached();
}

async function fetchNewsCategories(): Promise<NewsCategory[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "newsCategories",
    sort: "sortOrder",
    limit: 100,
    depth: 0,
  });
  return result.docs;
}

/** All categories, in editor-defined order — feeds the overview filter bar. */
export async function getNewsCategories(): Promise<NewsCategory[]> {
  const cached = unstable_cache(fetchNewsCategories, ["news-categories"], {
    tags: ["newsCategories"],
    revalidate: CACHE_TTL_SECONDS,
  });
  return cached();
}
