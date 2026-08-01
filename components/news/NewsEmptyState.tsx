import { ArrowLink } from "@/components/ui/ArrowLink";
import { ROUTES } from "@/lib/paths";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

const LABELS = {
  headline: "Keine News gefunden",
  hint: "Andere Suchbegriffe, ein weiterer Zeitraum oder eine andere Kategorie helfen vielleicht.",
};

type NewsEmptyStateProps = {
  /** Zeigt den Zuruecksetzen-Link nur, wenn ueberhaupt gefiltert wurde. */
  filtered: boolean;
  className?: string;
};

/** Gestalteter Leerzustand der News-Uebersicht. */
export function NewsEmptyState({ filtered, className }: NewsEmptyStateProps) {
  return (
    <div className={cn("border-fg-primary flex flex-col items-start border-t pt-8", className)}>
      <p className="heading-italic text-[20px] md:text-[24px]">{LABELS.headline}</p>
      <p className="text-muted mt-2 max-w-[560px] text-[14px] leading-[1.5] md:text-[16px]">
        {filtered ? LABELS.hint : strings.news.empty}
      </p>
      {filtered ? (
        <ArrowLink href={ROUTES.news} size="md" className="mt-6">
          {strings.news.filterReset}
        </ArrowLink>
      ) : null}
    </div>
  );
}
