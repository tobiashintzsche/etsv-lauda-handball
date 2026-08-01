import type { HeroSliderBlock, News } from "@payload-types";

import { formatDate } from "@/lib/format";
import { newsPath } from "@/lib/paths";
import { isMedia, isPopulated } from "@/lib/utils";

import { type HeroSlide, HeroSliderTrack } from "./Slider";

type HeroSliderProps = {
  block: HeroSliderBlock;
  news: News[];
};

/**
 * Server-Teil des Hero-Sliders: macht aus den News-Dokumenten die schlanken
 * Slide-Objekte, die der Client-Slider braucht.
 *
 * Beitraege ohne Titelbild fallen raus — ein Hero ohne Bild waere ein leerer
 * dunkler Kasten. Das Bild kommt in der `hero`-Variante (1920px), sonst als
 * Original.
 */
export function HeroSlider({ block, news }: HeroSliderProps) {
  const slides = news.flatMap<HeroSlide>((item) => {
    const cover = isMedia(item.coverImage) ? item.coverImage : null;
    const url = cover?.sizes?.hero?.url ?? cover?.url;
    if (!url) return [];

    const category = isPopulated<{ name?: string }>(item.category) ? item.category.name : null;

    return [
      {
        href: newsPath(item.slug),
        title: item.title,
        chip: category || formatDate(item.publishedAt),
        imageUrl: url,
        imageAlt: cover?.alt ?? item.title,
      },
    ];
  });

  if (!slides.length) return null;

  return <HeroSliderTrack slides={slides} anchorId={block.anchorId} />;
}
