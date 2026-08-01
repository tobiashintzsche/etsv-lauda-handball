import { strings } from "@/lib/strings";
import { CONTAINER_ARTICLE, SECTION_PADDING, cn } from "@/lib/utils";

/** Ladezustand der Artikelseite — gleiche Struktur wie der fertige Beitrag. */
export default function NewsArticleLoading() {
  return (
    <div className="texture-section-alt" aria-busy="true" aria-live="polite">
      <div className={cn(CONTAINER_ARTICLE, SECTION_PADDING)}>
        <span className="sr-only">{strings.common.loading}</span>

        <div className="animate-pulse">
          <div className="bg-fg-primary/20 h-[35px] w-4/5 md:h-[44px]" />
          <div className="bg-secondary/30 mt-2 h-[20px] w-[120px] md:h-[26px]" />
          <div className="bg-fg-primary/20 mt-4 ml-auto h-[14px] w-[180px]" />
          <div className="bg-fg-primary/20 mt-2 aspect-[728/375] w-full" />

          <div className="mt-8 flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-fg-primary/10 h-[16px] w-full last:w-2/3" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
