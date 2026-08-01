import Image from "next/image";

import type { News } from "@payload-types";
import type { SerializedUploadNode } from "@payloadcms/richtext-lexical";
import { type JSXConvertersFunction, RichText } from "@payloadcms/richtext-lexical/react";

import { cn, isMedia } from "@/lib/utils";

/**
 * Fliesstext des Artikels. Groessen und Abstaende kommen aus dem Design
 * (16px/1.5, 24px zwischen den Bloecken) — bewusst ohne `prose`-Plugin, das
 * seine eigene Typografie mitbringt.
 */
const BODY_STYLES = [
  "payload-richtext flex flex-col gap-6 text-[14px] leading-[1.5] md:text-[16px]",
  "[&_h2]:text-[24px] md:[&_h2]:text-[32px]",
  "[&_h3]:text-[20px] md:[&_h3]:text-[24px]",
  "[&_a]:text-secondary [&_a]:underline [&_a]:underline-offset-2",
  "[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mt-1",
  "[&_blockquote]:border-secondary [&_blockquote]:border-l-2 [&_blockquote]:pl-4",
  "[&_hr]:border-line",
].join(" ");

type ArticleBodyProps = {
  data: News["body"];
  className?: string;
};

/** Lexical-Artikeltext als JSX — inklusive Bild-Nodes mit Bildunterschrift. */
export function ArticleBody({ data, className }: ArticleBodyProps) {
  return <RichText data={data} converters={converters} className={cn(BODY_STYLES, className)} />;
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,

  /**
   * Defensiv: verschachtelte Absaetze wuerden zu `<p><p>` werden — ungueltiges
   * HTML, das React beim Hydrieren zerlegt. Leere Absaetze bleiben als
   * Leerzeile erhalten, weil Redakteure damit Luft im Text erzeugen.
   */
  paragraph: ({ node, nodesToJSX, parent }) => {
    const children = nodesToJSX({ nodes: node.children });

    if (children.length === 0) return <br />;
    if (parent?.type === "paragraph") return <>{children}</>;

    return <p>{children}</p>;
  },

  /**
   * Bilder im Text: `next/image` statt des Default-`<img>`, damit sie in den
   * 690px-Container skaliert und als WebP/AVIF ausgeliefert werden. Die
   * Bildunterschrift stammt aus dem Zusatzfeld der UploadFeature.
   */
  upload: ({ node }: { node: SerializedUploadNode }) => {
    const media = isMedia(node.value) ? node.value : null;
    if (!media?.url) return null;

    const caption = typeof node.fields?.caption === "string" ? node.fields.caption : null;

    // Andere Dateien (PDF, Dokumente) bleiben ein schlichter Download-Link.
    if (!media.mimeType?.startsWith("image/")) {
      return (
        <a href={media.url} download>
          {caption ?? media.filename ?? media.url}
        </a>
      );
    }

    return (
      <figure>
        <Image
          src={media.url}
          alt={media.alt ?? ""}
          width={media.width ?? 728}
          height={media.height ?? 410}
          sizes="(max-width: 768px) 100vw, 690px"
          className="h-auto w-full"
        />
        {caption ? (
          <figcaption className="text-muted mt-1 text-[12px] leading-[1.3] md:text-[10px]">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    );
  },
});
