import type { HeroSliderBlock } from "@payload-types";

import { getHeroNews } from "@/lib/news";

import { HeroSlider } from "./Component";

type HeroSliderServerProps = {
  block: HeroSliderBlock;
};

/** Fallback, falls das Select noch leer ist (Block vor der Migration angelegt). */
const DEFAULT_ITEM_COUNT = 3;

/**
 * Holt die Beitraege des Hero-Sliders.
 *
 * Der Baustein waehlt nichts von Hand aus: `getHeroNews` stellt die als
 * „Top-Beitrag“ markierten News nach vorn und fuellt mit den neuesten auf.
 * Ohne Treffer verschwindet der Hero komplett — ein leeres Bildband sieht nach
 * einem Fehler aus.
 */
export async function HeroSliderServer({ block }: HeroSliderServerProps) {
  const itemCount = Number(block.itemCount) || DEFAULT_ITEM_COUNT;
  const news = await getHeroNews(itemCount);

  if (!news.length) return null;

  return <HeroSlider block={block} news={news} />;
}
