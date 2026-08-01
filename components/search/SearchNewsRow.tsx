import Link from "next/link";

import type { News } from "@payload-types";

import { formatDate } from "@/lib/format";
import { newsPath } from "@/lib/paths";
import { isPopulated } from "@/lib/utils";

type SearchNewsRowProps = {
  news: News;
};

/**
 * Ein News-Treffer als kompakte Zeile: Meta („27.07.2026 / SPIELBERICHT“),
 * Titel, zwei Zeilen Teaser.
 *
 * Bewusst ohne Bild — anders als die NewsCard steht der Treffer hier neben
 * Mannschaften und Seiten, und eine Ergebnisliste liest sich schneller, wenn
 * alle Gruppen dieselbe Zeilenhoehe haben.
 */
export function SearchNewsRow({ news }: SearchNewsRowProps) {
  const category = isPopulated<{ name?: string }>(news.category) ? news.category.name : null;

  return (
    <li className="border-line/60 border-b last:border-b-0">
      <Link href={newsPath(news.slug)} className="group flex flex-col gap-1 py-3">
        <span className="flex items-center gap-[9px]">
          <span aria-hidden="true" className="bg-secondary h-[10px] w-[26px] shrink-0" />
          <span className="text-fg-primary text-[12px] leading-5 uppercase">
            {formatDate(news.publishedAt)}
            {category ? ` / ${category}` : ""}
          </span>
        </span>

        <h3 className="text-fg-primary group-hover:text-secondary font-sans text-[18px] leading-[26px] font-bold normal-case not-italic transition-colors md:text-[20px]">
          {news.title}
        </h3>

        {news.excerpt ? (
          <p className="text-muted line-clamp-2 text-[14px] leading-[1.3] md:text-[16px]">
            {news.excerpt}
          </p>
        ) : null}
      </Link>
    </li>
  );
}
