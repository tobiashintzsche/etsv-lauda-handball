import type { Metadata } from "next";

import { NewsTeaserSection } from "@/components/news/NewsTeaserSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ROUTES } from "@/lib/paths";
import { getSponsors } from "@/lib/sponsors";
import { strings } from "@/lib/strings";
import { CONTAINER, SECTION_PADDING, cn } from "@/lib/utils";

import { SponsorRow } from "./_components/SponsorRow";

export const metadata: Metadata = {
  title: strings.sponsors.title,
  description: "Die Partner und Foerderer des ETSV Lauda Handball.",
  alternates: { canonical: ROUTES.sponsors },
};

/**
 * Sponsorenseite. Als einzige Seite auf heller Beton-Textur mit schwarzem Text
 * — deshalb `texture-section-light` statt der SectionShell-Standardfarben.
 */
export default async function SponsorsPage() {
  const sponsors = await getSponsors();

  return (
    <>
      <div className="texture-section-light text-fg-secondary">
        <div className={cn(CONTAINER, SECTION_PADDING)}>
          <SectionHeader headline={strings.sponsors.title} as="h1" />

          {sponsors.length === 0 ? (
            <p className="mt-8 text-[16px] leading-[1.5]">{strings.sponsors.empty}</p>
          ) : (
            <ul className="mt-8 flex flex-col gap-12 md:gap-8">
              {sponsors.map((sponsor, index) => (
                <SponsorRow key={sponsor.id} sponsor={sponsor} reversed={index % 2 === 1} />
              ))}
            </ul>
          )}
        </div>
      </div>

      <NewsTeaserSection headline={strings.news.sectionHeadline} />
    </>
  );
}
