import { NewsCard } from "@/components/cards/NewsCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionShell } from "@/components/ui/SectionShell";
import { getNewsList } from "@/lib/news";
import { ROUTES } from "@/lib/paths";
import { strings } from "@/lib/strings";

/** Vier Karten — so viele Spalten hat das Raster im Design. */
const TEASER_COUNT = 4;

type NewsTeaserSectionProps = {
  /** Aktuell gelesener Beitrag — taucht in den Empfehlungen nicht auf. */
  excludeId?: string | number;
  /** Optional auf eine Mannschaft eingegrenzt. */
  teamId?: string | number;
  headline?: string;
};

/**
 * News-Teaser am Ende fester Routen (Artikel, Sponsoren).
 *
 * Der gleichnamige CMS-Baustein fuer redaktionelle Seiten liegt in `blocks/` —
 * hier geht es um Seiten ohne Layout-Feld, die den Abschnitt trotzdem tragen.
 * Mobil laeuft die Reihe als Scroll-Track mit Anschnitt (Design 6.5).
 */
export async function NewsTeaserSection({
  excludeId,
  teamId,
  headline = strings.news.relatedHeadline,
}: NewsTeaserSectionProps) {
  const { docs } = await getNewsList({ limit: TEASER_COUNT, excludeId, teamId });
  if (docs.length === 0) return null;

  return (
    <SectionShell background="primary">
      <SectionHeader
        headline={headline}
        link={{ label: strings.news.allNews, href: ROUTES.news }}
      />

      <div className="scroll-track -mx-4 mt-8 px-4 md:mx-0 md:grid md:grid-cols-4 md:px-0">
        {docs.map((news) => (
          <NewsCard key={news.id} news={news} className="w-[258px] md:w-auto" />
        ))}
      </div>
    </SectionShell>
  );
}
