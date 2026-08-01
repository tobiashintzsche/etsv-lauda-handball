import { ArrowLink } from "@/components/ui/ArrowLink";
import { ROUTES, pagePath, teamPath } from "@/lib/paths";
import type { SearchResults as Results } from "@/lib/search";
import { cn } from "@/lib/utils";

import { SearchNewsRow } from "./SearchNewsRow";
import { SearchResultGroup } from "./SearchResultGroup";

const LABELS = {
  news: "News",
  teams: "Mannschaften",
  pages: "Seiten",
  sponsors: "Sponsoren",
};

type SearchResultsProps = {
  results: Results;
  className?: string;
};

/** Eine Zeile in den Gruppen Mannschaften/Seiten/Sponsoren. */
const LINK_ROW = "border-line/60 flex flex-col gap-0.5 border-b py-3 last:border-b-0";

/**
 * Die Treffer, nach Inhaltsart gruppiert — in der Reihenfolge, in der Besucher
 * sie erwarten: erst die aktuellen News, dann Mannschaften, Seiten, Sponsoren.
 * Leere Gruppen fallen weg statt als „0 Treffer“ dazustehen.
 */
export function SearchResults({ results, className }: SearchResultsProps) {
  return (
    <div className={cn("flex flex-col gap-8 md:gap-12", className)}>
      {results.news.length > 0 ? (
        <SearchResultGroup title={LABELS.news} count={results.news.length}>
          {results.news.map((news) => (
            <SearchNewsRow key={news.id} news={news} />
          ))}
        </SearchResultGroup>
      ) : null}

      {results.teams.length > 0 ? (
        <SearchResultGroup title={LABELS.teams} count={results.teams.length}>
          {results.teams.map((team) => (
            <li key={team.id} className={LINK_ROW}>
              <ArrowLink href={teamPath(team.slug)} size="md">
                {team.name}
              </ArrowLink>
              {team.liga ? (
                <p className="label-italic text-secondary text-[14px]">{team.liga}</p>
              ) : null}
            </li>
          ))}
        </SearchResultGroup>
      ) : null}

      {results.pages.length > 0 ? (
        <SearchResultGroup title={LABELS.pages} count={results.pages.length}>
          {results.pages.map((page) => (
            <li key={page.id} className={LINK_ROW}>
              <ArrowLink href={pagePath(page.slug)} size="md">
                {page.title}
              </ArrowLink>
            </li>
          ))}
        </SearchResultGroup>
      ) : null}

      {results.sponsors.length > 0 ? (
        <SearchResultGroup title={LABELS.sponsors} count={results.sponsors.length}>
          {results.sponsors.map((sponsor) => (
            // Sponsoren haben keine eigene Detailseite — der Treffer fuehrt auf
            // die Uebersicht, wo das Unternehmen mit Logo und Text steht.
            <li key={sponsor.id} className={LINK_ROW}>
              <ArrowLink href={ROUTES.sponsors} size="md">
                {sponsor.name}
              </ArrowLink>
            </li>
          ))}
        </SearchResultGroup>
      ) : null}
    </div>
  );
}
