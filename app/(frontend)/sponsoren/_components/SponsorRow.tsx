import Image from "next/image";

import type { Sponsor } from "@payload-types";

import { ArrowLink } from "@/components/ui/ArrowLink";
import { strings } from "@/lib/strings";
import { cn, isMedia } from "@/lib/utils";

type SponsorRowProps = {
  sponsor: Sponsor;
  /** Jede zweite Reihe dreht Text und Logo (Design 2.5). */
  reversed?: boolean;
};

/**
 * Ein Sponsor als 3-Spalten-Reihe: Text ueber zwei Spalten, Logo ueber eine.
 * Auf dem Handy stapeln beide — Text zuerst, Logo darunter.
 */
export function SponsorRow({ sponsor, reversed = false }: SponsorRowProps) {
  const logo = isMedia(sponsor.logo) ? sponsor.logo : null;

  return (
    <li className="grid grid-cols-1 items-start gap-4 md:grid-cols-3 md:gap-8">
      <div className={cn("md:col-span-2", reversed && "md:order-2")}>
        {/* Firmennamen behalten ihre Schreibweise („b.safe", „Bohlender GmbH"). */}
        <h2 className="heading-italic text-[20px] normal-case md:text-[24px]">{sponsor.name}</h2>

        {sponsor.description ? (
          <p className="mt-4 text-[14px] leading-[1.5] md:text-[16px]">{sponsor.description}</p>
        ) : null}

        {sponsor.website ? (
          <ArrowLink href={sponsor.website} size="md" className="text-fg-secondary mt-4" external>
            {strings.sponsors.visitWebsite}
          </ArrowLink>
        ) : null}
      </div>

      {logo?.url ? (
        <div
          className={cn(
            "relative h-[180px] w-full md:h-[233px]",
            reversed ? "md:order-1" : "md:order-2",
          )}
        >
          <Image
            src={logo.url}
            alt={logo.alt ?? sponsor.name}
            fill
            sizes="(max-width: 768px) 90vw, 310px"
            className="object-contain object-left md:object-center"
          />
        </div>
      ) : null}
    </li>
  );
}
