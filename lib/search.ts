import type { Where } from "payload";

import type { News, Page, Sponsor, Team } from "@payload-types";

import { getPayloadClient, publishedNewsWhere } from "./payload";
import { searchTerms } from "./search-query";

/**
 * Loader of the global search (`/suche`).
 *
 * No `unstable_cache` here on purpose: a result list depends on the visitor's
 * term, not on a document, so a cache entry would be written once and read
 * never. The four queries run in parallel and are capped hard — the page stays
 * one round trip, whatever is typed.
 */

/** Hits per group. Ten is enough to judge a query without paging. */
const GROUP_LIMIT = 10;

export type SearchResults = {
  news: News[];
  teams: Team[];
  pages: Page[];
  sponsors: Sponsor[];
  /** Sum over all groups — drives the summary line and the empty state. */
  total: number;
};

const NO_RESULTS: SearchResults = { news: [], teams: [], pages: [], sponsors: [], total: 0 };

/**
 * Every term has to match at least one of the given fields.
 *
 * The terms are passed one by one instead of as a phrase: Payload's `like`
 * splits a value on spaces and requires all words within the *same* field, so
 * „perfekte saison“ would miss an article whose title carries one word and
 * whose teaser carries the other.
 */
function matchesTerms(terms: string[], fields: string[]): Where {
  return {
    and: terms.map((term) => ({
      or: fields.map((field): Where => ({ [field]: { like: term } })),
    })),
  };
}

/**
 * Searches news, teams, pages and sponsors at once.
 *
 * Callers must pass a query that already went through `parseSearchQuery` —
 * an empty or too short term returns an empty result instead of hitting the
 * database.
 */
export async function searchAll(query: string): Promise<SearchResults> {
  const terms = searchTerms(query);
  if (terms.length === 0) return NO_RESULTS;

  const payload = await getPayloadClient();

  const [news, teams, pages, sponsors] = await Promise.all([
    payload.find({
      collection: "news",
      // Same publish gate as every other public news query — a scheduled post
      // must not become findable before its date.
      where: { and: [publishedNewsWhere(), matchesTerms(terms, ["title", "excerpt"])] },
      sort: "-publishedAt",
      limit: GROUP_LIMIT,
      // depth 1 populates the category, which the result row shows. Nothing
      // else is followed.
      depth: 1,
    }),
    payload.find({
      collection: "teams",
      where: matchesTerms(terms, ["name", "liga"]),
      sort: "sortOrder",
      limit: GROUP_LIMIT,
      depth: 0,
    }),
    payload.find({
      collection: "pages",
      where: { and: [{ _status: { equals: "published" } }, matchesTerms(terms, ["title"])] },
      sort: "title",
      limit: GROUP_LIMIT,
      depth: 0,
    }),
    payload.find({
      collection: "sponsors",
      where: matchesTerms(terms, ["name"]),
      sort: "sortOrder",
      limit: GROUP_LIMIT,
      depth: 0,
    }),
  ]);

  // „noindex“ heisst: die Seite ist erreichbar, soll aber nicht aktiv
  // auffindbar sein — das gilt fuer die eigene Suche genauso wie fuer Google.
  const pageDocs = pages.docs.filter((page) => !page.meta?.noindex);

  return {
    news: news.docs,
    teams: teams.docs,
    pages: pageDocs,
    sponsors: sponsors.docs,
    total: news.docs.length + teams.docs.length + pageDocs.length + sponsors.docs.length,
  };
}
