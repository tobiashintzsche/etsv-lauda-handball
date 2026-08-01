import Image from "next/image";
import Link from "next/link";

import type { Sponsor, SponsorsBlock } from "@payload-types";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionShell } from "@/components/ui/SectionShell";
import { isMedia } from "@/lib/utils";

type SponsorsProps = {
  block: SponsorsBlock;
  sponsors: Sponsor[];
  isFirst?: boolean;
};

/** Logo eines Sponsors, bei hinterlegter Website als Link. */
function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  const logo = isMedia(sponsor.logo) ? sponsor.logo : null;
  if (!logo?.url) return null;

  const image = (
    <Image
      src={logo.url}
      alt={logo.alt ?? sponsor.name}
      fill
      sizes="(max-width: 768px) 45vw, 220px"
      className="object-contain transition-transform duration-300 group-hover:scale-105"
    />
  );

  return (
    <div className="relative h-[96px] w-full">
      {sponsor.website ? (
        <Link
          href={sponsor.website}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={sponsor.name}
          className="group absolute inset-0"
        >
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  );
}

/**
 * Sponsorenabschnitt fuer beliebige Seiten.
 *
 * Bewusst schlicht gehalten: ein Logoraster auf hellem Grund. Die ausfuehrliche,
 * alternierende Darstellung mit Beschreibungstext lebt auf der Sponsorenseite
 * selbst — hier reicht die Variante „detailed“ Name und Kurztext unter dem Logo
 * nach, ohne den Seitenrhythmus zu sprengen.
 */
export function Sponsors({ block, sponsors, isFirst = false }: SponsorsProps) {
  const detailed = block.variant === "detailed";

  return (
    <SectionShell background={block.sectionBackground} anchorId={block.anchorId}>
      <SectionHeader headline={block.headline} subline={block.subline} as={isFirst ? "h1" : "h2"} />

      <ul className="mt-6 grid grid-cols-2 gap-8 md:mt-8 md:grid-cols-4 md:gap-10">
        {sponsors.map((sponsor) => (
          <li key={sponsor.id} className="flex flex-col gap-2">
            <SponsorLogo sponsor={sponsor} />
            {detailed ? (
              <>
                <h3 className="text-[20px] md:text-[24px]">{sponsor.name}</h3>
                {sponsor.description ? (
                  <p className="text-[14px] leading-[1.5]">{sponsor.description}</p>
                ) : null}
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
