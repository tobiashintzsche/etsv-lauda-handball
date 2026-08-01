import type { Metadata } from "next";

import { NewsEmptyState } from "@/components/news/NewsEmptyState";
import { NewsFilters } from "@/components/news/NewsFilters";
import { NewsGrid } from "@/components/news/NewsGrid";
import { Pagination } from "@/components/news/Pagination";
import {
  type NewsFilters as Filters,
  currentSeason,
  hasActiveFilters,
  matchesPeriod,
  matchesSearch,
  newsHref,
  parseNewsFilters,
} from "@/components/news/filter-params";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { type NewsListResult, getNewsCategories, getNewsList } from "@/lib/news";
import { ROUTES } from "@/lib/paths";
import { strings } from "@/lib/strings";
import { getTeamBySlug } from "@/lib/teams";
import { CONTAINER, SECTION_PADDING, cn } from "@/lib/utils";

/** Zwei Reihen à vier Karten — das Raster des Designs. */
const PAGE_SIZE = 8;

/**
 * Obergrenze fuer die Suche im Speicher. Suchbegriff und Zeitraum lassen sich
 * nicht als Payload-`where` ausdruecken, ohne den geteilten Loader umzubauen —
 * bei aktivem Filter wird deshalb einmal breit geladen und danach gefiltert.
 */
const SEARCH_SCAN_LIMIT = 200;

const DESCRIPTION = "Alle Neuigkeiten, Spielberichte und Termine des ETSV Lauda Handball.";

type NewsOverviewPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: NewsOverviewPageProps): Promise<Metadata> {
  const filters = parseNewsFilters(await searchParams);
  const isNarrowed = hasActiveFilters(filters) || filters.page > 1 || Boolean(filters.team);

  return {
    title: strings.news.overviewTitle,
    description: DESCRIPTION,
    alternates: { canonical: ROUTES.news },
    // Gefilterte Ansichten sind Varianten derselben Liste — nicht indexieren.
    ...(isNarrowed && { robots: { index: false, follow: true } }),
  };
}

/**
 * News-Uebersicht. Feste Route (kein CMS-Baustein), weil Filter und
 * Seitenblaetterung ueber die URL laufen: `?search=&period=&category=&page=`.
 * Ein optionales `?team=<slug>` kommt von den Mannschaftsseiten.
 */
export default async function NewsOverviewPage({ searchParams }: NewsOverviewPageProps) {
  const filters = parseNewsFilters(await searchParams);

  const [categories, team] = await Promise.all([
    getNewsCategories(),
    filters.team ? getTeamBySlug(filters.team) : null,
  ]);

  const result = await loadNews(filters, team?.id);

  return (
    <div className={cn(CONTAINER, SECTION_PADDING)}>
      <SectionHeader headline={strings.news.overviewTitle} subline={team?.name} as="h1" />

      <NewsFilters
        filters={filters}
        categories={categories.map((category) => ({
          value: category.slug,
          label: category.name,
        }))}
        seasonLabel={currentSeason().label}
        className="mt-8"
      />

      {result.docs.length === 0 ? (
        <NewsEmptyState filtered={hasActiveFilters(filters)} className="mt-8" />
      ) : (
        <NewsGrid items={result.docs} className="mt-8" />
      )}

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        hrefFor={(page) => newsHref(filters, { page })}
        className="mt-8 md:mt-16"
      />
    </div>
  );
}

/**
 * Ohne Suche und Zeitraum blaettert Postgres — das ist der Normalfall und
 * bleibt pro Seite gecacht. Sonst wird die (nach Kategorie und Mannschaft
 * bereits eingegrenzte) Liste einmal geladen und im Speicher gefiltert.
 */
async function loadNews(filters: Filters, teamId?: string | number): Promise<NewsListResult> {
  const base = { category: filters.category || undefined, teamId };

  if (!filters.search && filters.period === "all") {
    return getNewsList({ ...base, page: filters.page, limit: PAGE_SIZE });
  }

  const { docs } = await getNewsList({ ...base, limit: SEARCH_SCAN_LIMIT });
  const now = new Date();
  const matched = docs.filter(
    (news) =>
      matchesSearch(news, filters.search) && matchesPeriod(news.publishedAt, filters.period, now),
  );

  const totalPages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);

  return {
    docs: matched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    totalDocs: matched.length,
    totalPages,
    page,
  };
}
