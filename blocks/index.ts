import type { Block } from "payload";

import { AboutBlock } from "./AboutBlock";
import { ContentBlock } from "./ContentBlock";
import { HeroSliderBlock } from "./HeroSliderBlock";
import { ImageGridBlock } from "./ImageGridBlock";
import { LeagueTableBlock } from "./LeagueTableBlock";
import { NewsTeaserBlock } from "./NewsTeaserBlock";
import { NextGamesBlock } from "./NextGamesBlock";
import { SponsorsBlock } from "./SponsorsBlock";

export {
  AboutBlock,
  ContentBlock,
  HeroSliderBlock,
  ImageGridBlock,
  LeagueTableBlock,
  NewsTeaserBlock,
  NextGamesBlock,
  SponsorsBlock,
};

/** Every block a Page may use, in the order the block picker shows them. */
export const pageBlocks: Block[] = [
  HeroSliderBlock,
  ContentBlock,
  NewsTeaserBlock,
  AboutBlock,
  ImageGridBlock,
  NextGamesBlock,
  LeagueTableBlock,
  SponsorsBlock,
];
