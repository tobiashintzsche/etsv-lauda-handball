import { cn } from "@/lib/utils";

type SearchResultGroupProps = {
  /** „News“, „Mannschaften“, … */
  title: string;
  /** Anzahl der Treffer in dieser Gruppe — steht gelb neben der Ueberschrift. */
  count: number;
  /** Ausschliesslich `<li>`-Elemente: die Gruppe bringt die Liste selbst mit. */
  children: React.ReactNode;
  className?: string;
};

/**
 * Ein Ergebnisblock der Suchseite: weisse Trennlinie, Ueberschrift mit
 * Trefferzahl, darunter die Liste. Haelt die vier Gruppen optisch gleich, ohne
 * dass jede ihre eigene Kopfzeile nachbaut.
 */
export function SearchResultGroup({ title, count, children, className }: SearchResultGroupProps) {
  return (
    <section className={cn("border-fg-primary border-t pt-6", className)}>
      <div className="flex items-baseline gap-2">
        <h2 className="heading-italic text-[20px] md:text-[24px]">{title}</h2>
        <span className="heading-italic text-secondary text-[16px] md:text-[18px]">{count}</span>
      </div>

      <ul className="mt-4 flex flex-col">{children}</ul>
    </section>
  );
}
