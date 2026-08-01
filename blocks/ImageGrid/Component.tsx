import Image from "next/image";

import type { ImageGridBlock } from "@payload-types";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionShell } from "@/components/ui/SectionShell";
import { isMedia } from "@/lib/utils";

type ImageGridProps = {
  block: ImageGridBlock;
  isFirst?: boolean;
};

/**
 * „Mehr als Handball“: Bildband auf Beton-Textur.
 *
 * Desktop: vier gleich hohe Kacheln ohne Spaltenabstand — die Bilder stossen
 * bewusst aneinander und bilden ein durchgehendes Band. Mobil laeuft dasselbe
 * Band horizontal, zwei Bilder sind sichtbar, das dritte ist angeschnitten.
 */
export function ImageGrid({ block, isFirst = false }: ImageGridProps) {
  const items = (block.images ?? []).filter((item) => isMedia(item.image));

  if (!items.length) return null;

  return (
    <SectionShell background={block.sectionBackground} anchorId={block.anchorId}>
      <SectionHeader headline={block.headline} subline={block.subline} as={isFirst ? "h1" : "h2"} />

      <div className="scroll-track mt-4 gap-0 md:mt-5 md:grid md:grid-cols-4 md:gap-y-10 md:overflow-visible">
        {items.map((item, index) => {
          const image = isMedia(item.image) ? item.image : null;
          if (!image?.url) return null;

          return (
            <figure key={item.id ?? index} className="w-[186px] md:w-full">
              <div className="relative h-[184px] w-full overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.alt ?? item.caption ?? block.headline}
                  fill
                  sizes="(max-width: 768px) 186px, 248px"
                  className="object-cover"
                />
              </div>
              {item.caption ? (
                <figcaption className="mt-1 text-[12px] leading-[1.3] md:text-[10px]">
                  {item.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        })}
      </div>
    </SectionShell>
  );
}
