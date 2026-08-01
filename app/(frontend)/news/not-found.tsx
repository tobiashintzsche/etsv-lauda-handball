import { ArrowLink } from "@/components/ui/ArrowLink";
import { ROUTES } from "@/lib/paths";
import { strings } from "@/lib/strings";
import { CONTAINER, cn } from "@/lib/utils";

const LABELS = {
  code: "404",
  headline: "Beitrag nicht gefunden",
  text: "Dieser Beitrag wurde verschoben oder gelöscht. In der Übersicht stehen alle aktuellen News.",
};

/** Greift fuer /news und alle Artikel-Slugs, die es nicht (mehr) gibt. */
export default function NewsNotFound() {
  return (
    <div className={cn(CONTAINER, "flex min-h-[60vh] flex-col justify-center py-16")}>
      <p className="heading-italic text-secondary text-[18px] md:text-[24px]">{LABELS.code}</p>
      <h1 className="heading-italic mt-1 text-[32px] md:text-[40px]">{LABELS.headline}</h1>
      <p className="text-muted mt-4 max-w-[560px] text-[16px] leading-[1.5]">{LABELS.text}</p>
      <ArrowLink href={ROUTES.news} className="mt-8">
        {strings.news.overviewTitle}
      </ArrowLink>
    </div>
  );
}
