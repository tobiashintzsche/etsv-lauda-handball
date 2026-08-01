import { ArrowLink } from "@/components/ui/ArrowLink";
import { ROUTES } from "@/lib/paths";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

const LABELS = {
  headline: "Keine Treffer",
  hint: (query: string) =>
    `Zu „${query}“ haben wir nichts gefunden. Ein kürzeres oder anderes Wort hilft ` +
    `oft weiter — durchsucht werden News, Mannschaften, Seiten und Sponsoren.`,
};

type SearchEmptyStateProps = {
  /** Der gesuchte Begriff — steht im Hinweistext, damit klar ist, worauf er sich bezieht. */
  query: string;
  className?: string;
};

/**
 * Leerzustand der Suche. Gleiche Bauform wie der Leerzustand der
 * News-Uebersicht (Linie, Headline, Hinweis, Ausweg) — eine Sackgasse ohne
 * Weiterklick-Angebot gibt es auf dieser Seite nicht.
 */
export function SearchEmptyState({ query, className }: SearchEmptyStateProps) {
  return (
    <div className={cn("border-fg-primary flex flex-col items-start border-t pt-8", className)}>
      <p className="heading-italic text-[20px] md:text-[24px]">{LABELS.headline}</p>
      <p className="text-muted mt-2 max-w-[560px] text-[14px] leading-[1.5] md:text-[16px]">
        {LABELS.hint(query)}
      </p>
      <ArrowLink href={ROUTES.news} size="md" className="mt-6">
        {strings.news.allNews}
      </ArrowLink>
    </div>
  );
}
