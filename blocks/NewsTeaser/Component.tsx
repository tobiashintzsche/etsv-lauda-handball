import type { News, NewsTeaserBlock } from "@payload-types";

import { NewsCard } from "@/components/cards/NewsCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionShell } from "@/components/ui/SectionShell";
import { ROUTES } from "@/lib/paths";
import { strings } from "@/lib/strings";

type NewsTeaserProps = {
  block: NewsTeaserBlock;
  news: News[];
  isFirst?: boolean;
};

/**
 * News-Teaser: Abschnittskopf „NEWS / ZU ALLEN NEWS →“ und darunter die
 * neuesten Beitraege.
 *
 * Die Karten laufen auf jeder Breite in einem horizontalen Track mit fester
 * Kartenbreite (258px). Auf dem Desktop passen damit dreieinhalb Karten in den
 * 1024px-Container — der Anschnitt der vierten ist so gezeichnet und signalisiert,
 * dass es weitergeht. Nicht zu einem vierspaltigen Grid „korrigieren“.
 */
export function NewsTeaser({ block, news, isFirst = false }: NewsTeaserProps) {
  return (
    <SectionShell background={block.sectionBackground} anchorId={block.anchorId}>
      <SectionHeader
        headline={block.headline || strings.news.sectionHeadline}
        as={isFirst ? "h1" : "h2"}
        link={
          block.showAllLink === false ? null : { label: strings.news.allNews, href: ROUTES.news }
        }
      />

      <div className="scroll-track mt-4 md:mt-5">
        {news.map((item, index) => (
          <NewsCard key={item.id} news={item} className="w-[258px]" priority={index < 2} />
        ))}
      </div>
    </SectionShell>
  );
}
