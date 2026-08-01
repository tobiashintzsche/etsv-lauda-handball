import type { News } from "@payload-types";

import { NewsCard } from "@/components/cards/NewsCard";
import { cn } from "@/lib/utils";

/** Desktop-Raster des Designs: vier Spalten, Reihen durch Linien getrennt. */
const COLUMNS = 4;

/**
 * Trennlinien innerhalb einer Reihe. Eine Reihe fuellt ab `lg` genau eine
 * Bildschirmzeile — dort zieht der Reihen-Container die Linie, damit sie ohne
 * Luecke ueber alle vier Spalten laeuft. Darunter bricht die Reihe um, also
 * traegt die Karte selbst die Linie.
 *
 * Die Regeln sind bewusst auf sich ausschliessende Breakpoint-Bereiche
 * begrenzt (`max-sm`, `sm:max-lg`) — sonst muesste eine Zuruecksetz-Regel die
 * vorige ueberschreiben, was an der hoeheren Spezifitaet der `nth-child`-
 * Selektoren scheitert.
 */
const ITEM_DIVIDERS = [
  "[&>*]:border-fg-primary",
  "max-sm:[&>*+*]:border-t max-sm:[&>*+*]:pt-8",
  "sm:max-lg:[&>*:nth-child(n+3)]:border-t sm:max-lg:[&>*:nth-child(n+3)]:pt-8",
].join(" ");

type NewsGridProps = {
  items: News[];
  className?: string;
};

/** Karten-Raster der News-Uebersicht (Design 2.3). */
export function NewsGrid({ items, className }: NewsGridProps) {
  const rows: News[][] = [];
  for (let index = 0; index < items.length; index += COLUMNS) {
    rows.push(items.slice(index, index + COLUMNS));
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {rows.map((row, rowIndex) => (
        <div
          key={row[0]?.id ?? rowIndex}
          className={cn(
            "grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4",
            rowIndex > 0 && "border-fg-primary mt-8 border-t pt-8",
            ITEM_DIVIDERS,
          )}
        >
          {row.map((news, index) => (
            <NewsCard key={news.id} news={news} priority={rowIndex === 0 && index < 2} />
          ))}
        </div>
      ))}
    </div>
  );
}
