import type { ContentBlock } from "@payload-types";
import { RichText as PayloadRichText } from "@payloadcms/richtext-lexical/react";

import { CmsCta } from "@/components/ui/CmsCta";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionShell } from "@/components/ui/SectionShell";
import { cn } from "@/lib/utils";

type ContentProps = {
  block: ContentBlock;
  /** Erster Baustein einer Seite ohne eigenen Titel-Header → Ueberschrift wird zur h1. */
  isFirst?: boolean;
};

/**
 * Typography for the CMS body copy.
 *
 * Deliberately no `prose`: the typography plugin hard-codes its own text
 * colour, which would break the light section variants. Colour comes from the
 * surrounding `SectionShell` instead — headings already inherit the condensed
 * italic face from the base layer.
 */
const RICH_TEXT_CLASSES = cn(
  "payload-richtext max-w-[768px] text-[14px] leading-[1.5] md:text-[16px]",
  "[&_p]:mb-4 [&_p:last-child]:mb-0",
  "[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-[20px] md:[&_h2]:text-[24px]",
  "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-[18px] md:[&_h3]:text-[20px]",
  "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5",
  "[&_li]:mb-1",
  "[&_a]:text-secondary [&_a]:underline [&_a]:underline-offset-2",
  "[&_blockquote]:border-secondary [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:pl-4",
);

/**
 * Freier Textabschnitt mit optionalem Handlungsaufruf — das Arbeitspferd fuer
 * Impressum, Kontakt und Vereinsgeschichte.
 */
export function Content({ block, isFirst = false }: ContentProps) {
  const { headline, subline, richText, link, sectionBackground, anchorId } = block;

  return (
    <SectionShell background={sectionBackground} anchorId={anchorId}>
      {headline ? (
        <SectionHeader
          headline={headline}
          subline={subline}
          as={isFirst ? "h1" : "h2"}
          className="mb-5 md:mb-6"
        />
      ) : null}

      <PayloadRichText data={richText} className={RICH_TEXT_CLASSES} />

      <CmsCta link={link} className="mt-6" />
    </SectionShell>
  );
}
