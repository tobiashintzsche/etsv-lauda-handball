import Image from "next/image";

import type { News, NewsCategory, Team } from "@payload-types";

import { formatDate, toIsoDate } from "@/lib/format";
import { isMedia, isPopulated } from "@/lib/utils";

/**
 * Kopf der Artikelseite (Design 2.4).
 *
 * Reihenfolge: Titel, gelbe Subline (Mannschaft, sonst Kategorie), rechts-
 * buendige Meta-Zeile „DD.MM.YYYY / KATEGORIE“, dann das Titelbild.
 */
export function ArticleHeader({ news }: { news: News }) {
  const category = isPopulated<NewsCategory>(news.category) ? news.category : null;
  const team = isPopulated<Team>(news.team) ? news.team : null;
  const subline = team?.name ?? category?.name ?? null;
  const cover = isMedia(news.coverImage) ? news.coverImage : null;

  return (
    <header>
      {/* Artikeltitel bleiben in Original-Schreibweise — anders als die
          Sektions-Ueberschriften, die das Design durchgaengig versalisiert. */}
      <h1 className="heading-italic text-[32px] normal-case md:text-[40px]">{news.title}</h1>

      {subline ? (
        <p className="heading-italic text-secondary text-[18px] md:text-[24px]">{subline}</p>
      ) : null}

      <p className="mt-4 text-right text-[12px] leading-5 uppercase">
        <time dateTime={toIsoDate(news.publishedAt)}>{formatDate(news.publishedAt)}</time>
        {category ? ` / ${category.name}` : ""}
      </p>

      {cover?.url ? (
        <div className="relative mt-2 aspect-[728/375] w-full overflow-hidden">
          <Image
            src={cover.url}
            alt={cover.alt ?? news.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 690px"
            className="object-cover"
          />
        </div>
      ) : null}
    </header>
  );
}
