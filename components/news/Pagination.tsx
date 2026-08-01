import Link from "next/link";

import { PaginationArrowIcon } from "@/components/icons";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

const LABELS = {
  nav: "Seitenauswahl",
  page: (page: number) => `Seite ${page}`,
};

/** Sichtfenster um die aktuelle Seite — plus immer erste und letzte Seite. */
const WINDOW_SIZE = 3;

type PaginationProps = {
  page: number;
  totalPages: number;
  /** Baut das Ziel einer Seitenzahl — die Uebersicht haengt ihre Filter an. */
  hrefFor: (page: number) => string;
  className?: string;
};

/**
 * Seitenblaetterung nach Design 3.14: „‹ 1 2 3 … 500 ›“, die aktive Zahl mit
 * gelbem 2px-Unterstrich. Reine Server-Komponente — jede Seite ist ein Link.
 */
export function Pagination({ page, totalPages, hrefFor, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const current = Math.min(Math.max(page, 1), totalPages);

  return (
    <nav
      aria-label={LABELS.nav}
      className={cn("flex items-center justify-center gap-2", className)}
    >
      <Arrow
        href={current > 1 ? hrefFor(current - 1) : null}
        label={strings.news.previousPage}
        direction="previous"
      />

      {paginationItems(current, totalPages).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} aria-hidden="true" className="heading-italic px-1 text-[20px]">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-label={LABELS.page(item)}
            aria-current={item === current ? "page" : undefined}
            className={cn(
              "heading-italic hover:text-secondary w-[30px] p-1 text-center text-[20px] transition-colors",
              item === current && "border-secondary border-b-2",
            )}
          >
            {item}
          </Link>
        ),
      )}

      <Arrow
        href={current < totalPages ? hrefFor(current + 1) : null}
        label={strings.news.nextPage}
        direction="next"
      />
    </nav>
  );
}

/** Pfeil-Schaltflaeche. Ohne Ziel bleibt sie sichtbar, aber inaktiv. */
function Arrow({
  href,
  label,
  direction,
}: {
  href: string | null;
  label: string;
  direction: "previous" | "next";
}) {
  const icon = (
    <PaginationArrowIcon className={cn("h-5 w-5", direction === "previous" && "rotate-180")} />
  );

  if (!href) {
    return (
      <span aria-hidden="true" className="opacity-30">
        {icon}
      </span>
    );
  }

  return (
    <Link href={href} aria-label={label} className="hover:text-secondary transition-colors">
      {icon}
    </Link>
  );
}

/**
 * Seitenzahlen mit Auslassungen. Das Fenster bleibt immer drei Zahlen breit,
 * damit die Leiste beim Blaettern nicht in der Breite springt.
 */
export function paginationItems(page: number, totalPages: number): (number | "gap")[] {
  const start = Math.max(1, Math.min(page - 1, totalPages - WINDOW_SIZE + 1));
  const end = Math.min(totalPages, start + WINDOW_SIZE - 1);
  const items: (number | "gap")[] = [];

  if (start > 1) {
    items.push(1);
    if (start > 2) items.push("gap");
  }

  for (let index = start; index <= end; index += 1) items.push(index);

  if (end < totalPages) {
    if (end < totalPages - 1) items.push("gap");
    items.push(totalPages);
  }

  return items;
}
