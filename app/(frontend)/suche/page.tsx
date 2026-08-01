import type { Metadata } from "next";

import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { SearchField } from "@/components/search/SearchField";
import { SearchResults } from "@/components/search/SearchResults";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { searchAll } from "@/lib/search";
import { SEARCH_PARAM, isSearchable, parseSearchQuery } from "@/lib/search-query";
import { strings } from "@/lib/strings";
import { CONTAINER, SECTION_PADDING, cn } from "@/lib/utils";

const LABELS = {
  hint:
    "Gib oben einen Suchbegriff ein — durchsucht werden News, Mannschaften, " +
    "Seiten und Sponsoren.",
  // „Treffer“ ist im Deutschen im Singular wie im Plural gleich.
  summary: (count: number, query: string) => `${count} Treffer für „${query}“`,
};

export const metadata: Metadata = {
  title: strings.common.search,
  // Eine Ergebnisliste gehoert in keinen Suchmaschinen-Index: sie hat keinen
  // eigenen Inhalt und existiert in beliebig vielen Varianten.
  robots: { index: false, follow: true },
};

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Globale Suche. Feste Route (kein CMS-Baustein), weil der Begriff in der URL
 * steht: `/suche?q=…` ist teilbar, im Verlauf auffindbar und funktioniert ohne
 * JavaScript — das Feld schickt sich notfalls per Formular selbst ab.
 *
 * Im Figma ist die Seite nicht gezeichnet (§6.9: „frei nach System gestalten“).
 * Uebernommen sind deshalb Container 1024, der Abschnittskopf und die Optik der
 * News-Filterleiste (§3.13) fuer das Suchfeld.
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = parseSearchQuery((await searchParams)[SEARCH_PARAM]);
  const results = isSearchable(query) ? await searchAll(query) : null;

  return (
    <div className={cn(CONTAINER, SECTION_PADDING)}>
      <SectionHeader
        headline={strings.common.search}
        subline={results ? LABELS.summary(results.total, query) : null}
        as="h1"
      />

      <SearchField initialQuery={query} className="mt-6 md:mt-8" />

      {results === null ? (
        <p className="text-muted mt-8 max-w-[560px] text-[14px] leading-[1.5] md:text-[16px]">
          {LABELS.hint}
        </p>
      ) : results.total === 0 ? (
        <SearchEmptyState query={query} className="mt-8" />
      ) : (
        <SearchResults results={results} className="mt-8" />
      )}
    </div>
  );
}
