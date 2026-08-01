import Image from "next/image";
import Link from "next/link";

import type { News } from "@payload-types";

import { formatDate } from "@/lib/format";
import { newsPath } from "@/lib/paths";
import { cn, isMedia, isPopulated } from "@/lib/utils";

type NewsCardProps = {
  news: News;
  className?: string;
  /** LCP-Hinweis fuer die ersten sichtbaren Karten. */
  priority?: boolean;
};

/**
 * News-Karte nach Design 3.3.
 *
 * Aufbau: Bild (Seitenverhaeltnis ~1.65:1), Meta-Zeile mit gelbem Balken,
 * Titel, Teaser. Die Breite kommt vom Elternelement (Grid-Spalte bzw.
 * Scroll-Track) — die Karte selbst ist immer 100% breit.
 */
export function NewsCard({ news, className, priority = false }: NewsCardProps) {
  const cover = isMedia(news.coverImage) ? news.coverImage : null;
  const category = isPopulated<{ name?: string }>(news.category) ? news.category.name : null;

  return (
    <article className={cn("group flex w-full flex-col gap-1", className)}>
      <Link href={newsPath(news.slug)} className="flex flex-col gap-1">
        {cover?.url ? (
          <div className="relative aspect-[258/156] w-full overflow-hidden">
            <Image
              src={cover.url}
              alt={cover.alt ?? news.title}
              fill
              sizes="(max-width: 768px) 90vw, 258px"
              priority={priority}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : null}

        <div className="flex items-center gap-[9px]">
          <span aria-hidden="true" className="bg-secondary h-[10px] w-[26px] shrink-0" />
          <p className="text-fg-primary text-[12px] leading-5 uppercase">
            {formatDate(news.publishedAt)}
            {category ? ` / ${category}` : ""}
          </p>
        </div>

        <h3 className="text-fg-primary group-hover:text-secondary font-sans text-[20px] leading-[26px] font-bold normal-case not-italic transition-colors">
          {news.title}
        </h3>

        <p className="text-muted mt-[10px] text-[14px] leading-[1.3] md:text-[16px]">
          {news.excerpt}
        </p>
      </Link>
    </article>
  );
}
