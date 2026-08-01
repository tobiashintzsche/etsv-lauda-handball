import { strings } from "@/lib/strings";
import { CONTAINER, SECTION_PADDING, cn } from "@/lib/utils";

/** So viele Platzhalter zeigt das Raster — eine volle Seite. */
const PLACEHOLDERS = 8;

/**
 * Ladezustand der News-Routen. Spiegelt das Raster der Uebersicht, damit beim
 * Filtern und Blaettern nichts springt.
 */
export default function NewsLoading() {
  return (
    <div className={cn(CONTAINER, SECTION_PADDING)} aria-busy="true" aria-live="polite">
      <span className="sr-only">{strings.common.loading}</span>

      <div className="bg-fg-primary/20 h-[35px] w-[220px] animate-pulse md:h-[44px]" />

      <div className="mt-8 flex flex-col gap-2 md:flex-row md:gap-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border-line h-[31px] flex-1 border-b" />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: PLACEHOLDERS }).map((_, index) => (
          <div key={index} className="flex animate-pulse flex-col gap-2">
            <div className="bg-fg-primary/20 aspect-[258/156] w-full" />
            <div className="bg-fg-primary/20 h-[10px] w-1/2" />
            <div className="bg-fg-primary/20 h-[20px] w-4/5" />
            <div className="bg-fg-primary/10 h-[42px] w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
