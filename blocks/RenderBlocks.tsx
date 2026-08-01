import type { Page } from "@payload-types";

import { About } from "@/blocks/About/Component";
import { Content } from "@/blocks/Content/Component";
import { HeroSliderServer } from "@/blocks/HeroSlider/Server";
import { ImageGrid } from "@/blocks/ImageGrid/Component";
import { LeagueTableServer } from "@/blocks/LeagueTable/Server";
import { NewsTeaserServer } from "@/blocks/NewsTeaser/Server";
import { NextGamesServer } from "@/blocks/NextGames/Server";
import { SponsorsServer } from "@/blocks/Sponsors/Server";

type Block = NonNullable<Page["layout"]>[number];

type RenderBlocksProps = {
  blocks: Page["layout"];
  /**
   * Setzt die Seite bereits selbst eine h1 (Titel-Header)? Dann bleibt der
   * erste Baustein bei h2 — sonst haette die Seite zwei Hauptueberschriften.
   */
  pageHasHeading?: boolean;
};

/**
 * Bausteine ohne Abschnittskopf. Sie koennen die h1 der Seite nicht tragen und
 * duerfen sie deshalb auch nicht „verbrauchen“: der Hero-Slider zeigt einen
 * wechselnden News-Titel — als h1 waere das schlicht falsch.
 */
const BLOCKS_WITHOUT_HEADING: ReadonlySet<Block["blockType"]> = new Set(["heroSlider"]);

/**
 * Dispatcher fuer die Bausteine einer Payload-Seite.
 *
 * Alle Komponenten bekommen das rohe Block-Objekt als `block` — kein Spread.
 * Ein Spread wuerde die Payload-Discriminated-Union aufloesen und `blockType`
 * mit in die Props schleppen; so bleibt jede Komponente an genau einen
 * generierten Typ gebunden.
 *
 * Die datengetriebenen Bausteine (News, Spiele, Tabelle, Sponsoren) sind
 * asynchrone Server-Komponenten und werden hier direkt gerendert — jeder holt
 * seine Daten selbst, statt sie durch die Seite zu reichen.
 */
export function RenderBlocks({ blocks, pageHasHeading = false }: RenderBlocksProps) {
  if (!blocks?.length) return null;

  // Der erste Baustein, der ueberhaupt eine Ueberschrift rendern kann, traegt
  // die h1 — nicht zwingend der erste Baustein der Seite.
  const headingIndex = blocks.findIndex((block) => !BLOCKS_WITHOUT_HEADING.has(block.blockType));

  return (
    <>
      {blocks.map((block, index) => {
        const key = block.id ?? index;
        const isFirst = index === headingIndex && !pageHasHeading;

        switch (block.blockType) {
          case "heroSlider":
            return <HeroSliderServer key={key} block={block} />;
          case "content":
            return <Content key={key} block={block} isFirst={isFirst} />;
          case "newsTeaser":
            return <NewsTeaserServer key={key} block={block} isFirst={isFirst} />;
          case "about":
            return <About key={key} block={block} isFirst={isFirst} />;
          case "imageGrid":
            return <ImageGrid key={key} block={block} isFirst={isFirst} />;
          case "nextGames":
            return <NextGamesServer key={key} block={block} />;
          case "leagueTable":
            return <LeagueTableServer key={key} block={block} />;
          case "sponsorsBlock":
            return <SponsorsServer key={key} block={block} isFirst={isFirst} />;
          default:
            return null;
        }
      })}
    </>
  );
}
