import { strings } from "@/lib/strings";
import { CONTAINER, SECTION_PADDING, cn } from "@/lib/utils";

/**
 * Platzhalter waehrend eine Route laedt.
 *
 * Bewusst grob: ein Abschnittskopf und eine Kartenreihe — genug, damit die
 * Seite nicht springt, wenn der echte Inhalt eintrifft. Die Flaechen sind
 * halbtransparentes Weiss, damit der Skelettaufbau auf allen dunklen
 * Sektionsfarben funktioniert.
 */
export default function Loading() {
  return (
    <div className={cn(CONTAINER, SECTION_PADDING)} aria-busy="true" aria-live="polite">
      <span className="sr-only">{strings.common.loading}</span>

      <div className="animate-pulse">
        <div className="h-8 w-48 bg-white/10" />
        <div className="mt-3 h-5 w-32 bg-white/5" />

        <div className="mt-8 flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-[258px] shrink-0">
              <div className="aspect-[258/156] w-full bg-white/10" />
              <div className="mt-3 h-3 w-32 bg-white/5" />
              <div className="mt-2 h-5 w-full bg-white/10" />
              <div className="mt-2 h-4 w-3/4 bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
