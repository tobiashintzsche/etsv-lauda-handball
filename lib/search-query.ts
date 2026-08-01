import { ROUTES } from "./paths";

/**
 * Pure helpers of the global search.
 *
 * Deliberately free of any Payload import: the search field is a client
 * component and must not drag the CMS config into the browser bundle — that
 * lives in `lib/search.ts`. Everything here is a plain function, so it is
 * covered by unit tests (`tests/search-query.test.ts`).
 */

/** Query-string key of the term: `/suche?q=…`. */
export const SEARCH_PARAM = "q";

/** A single character matches half the site — not worth a database round trip. */
export const MIN_QUERY_LENGTH = 2;

/** Nothing sensible is longer; the cap keeps pathological URLs out of the query. */
const MAX_QUERY_LENGTH = 80;

/** Upper bound of words that are ANDed together. */
const MAX_TERMS = 5;

/**
 * `%`, `_` and `\` are wildcards of the SQL LIKE that the loader builds around
 * every term. They are dropped rather than escaped — no title, league or
 * sponsor name on this site legitimately contains them.
 */
const LIKE_WILDCARDS = /[%_\\]/g;

/** Punctuation at a word's edge: „Meister!“ searches for `meister`. */
const EDGE_PUNCTUATION = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;

type RawParam = string | string[] | undefined;

/** Reads `?q=` into a trimmed, collapsed, length-capped single line. */
export function parseSearchQuery(value: RawParam): string {
  const raw = Array.isArray(value) ? value[0] : value;

  return (raw ?? "")
    .replace(LIKE_WILDCARDS, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_QUERY_LENGTH)
    .trim();
}

/** True as soon as the query is long enough to be searched for. */
export function isSearchable(query: string): boolean {
  return query.length >= MIN_QUERY_LENGTH;
}

/**
 * The words a query is broken into. Every word has to appear somewhere in the
 * searched fields, order does not matter — „saison perfekte“ finds the same
 * article as „perfekte saison“.
 *
 * Lowercasing is cosmetic: the database compares case-insensitively (ILIKE).
 * It keeps the deduplication honest, so „Lauda lauda“ stays one term.
 */
export function searchTerms(query: string): string[] {
  const words = query
    .split(" ")
    .map((word) => word.replace(EDGE_PUNCTUATION, ""))
    .filter((word) => word.length >= MIN_QUERY_LENGTH);

  // A query made of nothing but one-character words would search for nothing
  // at all — fall back to the raw query as a single term.
  const terms = words.length > 0 ? words : [query.trim()];

  return [...new Set(terms.map((term) => term.toLowerCase()))].filter(Boolean).slice(0, MAX_TERMS);
}

/** Search-page URL for a term. An empty term keeps the bare route. */
export function searchHref(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return ROUTES.search;

  const params = new URLSearchParams({ [SEARCH_PARAM]: trimmed });
  return `${ROUTES.search}?${params.toString()}`;
}
