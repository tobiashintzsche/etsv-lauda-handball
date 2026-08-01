import type { News } from "@payload-types";

import { ROUTES } from "@/lib/paths";
import { isPopulated } from "@/lib/utils";

/**
 * Filter state of the news overview.
 *
 * The URL is the single source of truth: the page reads `searchParams` on the
 * server, the filter bar only writes them back. Nothing here touches Payload —
 * these are pure helpers so they stay testable.
 */

/** Query-string keys — shared by page, filter bar and pagination. */
export const NEWS_PARAM = {
  search: "search",
  period: "period",
  category: "category",
  team: "team",
  page: "page",
} as const;

export const PERIODS = ["all", "last30", "season", "older"] as const;
export type Period = (typeof PERIODS)[number];

export type NewsFilters = {
  /** Free-text term, matched against title, teaser, tags and category. */
  search: string;
  period: Period;
  /** Category slug — empty means "all categories". */
  category: string;
  /** Team slug — set when the overview is opened from a team page. */
  team: string;
  /** 1-based page number. */
  page: number;
};

export const DEFAULT_FILTERS: NewsFilters = {
  search: "",
  period: "all",
  category: "",
  team: "",
  page: 1,
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
}

/** Reads the query string into a fully defaulted, validated filter object. */
export function parseNewsFilters(params: RawSearchParams): NewsFilters {
  const period = first(params[NEWS_PARAM.period]) as Period;
  const page = Number.parseInt(first(params[NEWS_PARAM.page]), 10);

  return {
    search: first(params[NEWS_PARAM.search]),
    period: PERIODS.includes(period) ? period : "all",
    category: first(params[NEWS_PARAM.category]),
    team: first(params[NEWS_PARAM.team]),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** True when the visitor narrowed the list — the team context does not count. */
export function hasActiveFilters(filters: NewsFilters): boolean {
  return Boolean(filters.search) || filters.period !== "all" || Boolean(filters.category);
}

/** Overview URL for a modified filter set. Defaults are omitted to keep it short. */
export function newsHref(filters: NewsFilters, overrides: Partial<NewsFilters> = {}): string {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (merged.search) params.set(NEWS_PARAM.search, merged.search);
  if (merged.period !== "all") params.set(NEWS_PARAM.period, merged.period);
  if (merged.category) params.set(NEWS_PARAM.category, merged.category);
  if (merged.team) params.set(NEWS_PARAM.team, merged.team);
  if (merged.page > 1) params.set(NEWS_PARAM.page, String(merged.page));

  const query = params.toString();
  return query ? `${ROUTES.news}?${query}` : ROUTES.news;
}

/** July — the German handball season runs from summer to summer. */
const SEASON_START_MONTH = 6;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Start and short label ("26/27") of the season the given date belongs to. */
export function currentSeason(now: Date = new Date()): { start: Date; label: string } {
  const startYear =
    now.getMonth() >= SEASON_START_MONTH ? now.getFullYear() : now.getFullYear() - 1;

  return {
    start: new Date(startYear, SEASON_START_MONTH, 1),
    label: `${String(startYear).slice(-2)}/${String(startYear + 1).slice(-2)}`,
  };
}

export function matchesPeriod(
  publishedAt: string | null | undefined,
  period: Period,
  now: Date = new Date(),
): boolean {
  if (period === "all") return true;

  const date = publishedAt ? new Date(publishedAt) : null;
  if (!date || Number.isNaN(date.getTime())) return false;

  if (period === "last30") return now.getTime() - date.getTime() <= THIRTY_DAYS_MS;

  const seasonStart = currentSeason(now).start;
  return period === "season" ? date >= seasonStart : date < seasonStart;
}

/** Lowercase and strip diacritics so "Jugend" also finds "Jügend". */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Every search word must appear somewhere in the post — order does not matter. */
export function matchesSearch(news: News, term: string): boolean {
  const words = normalize(term).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;

  const category = isPopulated<{ name?: string }>(news.category) ? news.category.name : null;
  const haystack = normalize(
    [news.title, news.excerpt, category, ...(news.tags?.map((tag) => tag.value) ?? [])]
      .filter(Boolean)
      .join(" "),
  );

  return words.every((word) => haystack.includes(word));
}
