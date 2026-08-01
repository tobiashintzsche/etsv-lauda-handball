import Image from "next/image";
import Link from "next/link";

import type { Footer as FooterGlobal } from "@payload-types";

import { ExternalLinkIcon } from "@/components/icons";
import { externalLinkProps, resolveHref } from "@/lib/links";
import { strings } from "@/lib/strings";
import { cn, isMedia } from "@/lib/utils";

type MemberBannerProps = {
  /** Gruppe `memberCard` aus dem Global `footer`. */
  card?: FooterGlobal["memberCard"];
  /** Fallback-Ziel aus den Vereinsdaten (`site-settings.membershipUrl`). */
  membershipUrl?: string | null;
  className?: string;
};

/** Ohne eigenes Bild traegt das Vereinswappen den Banner. */
const FALLBACK_IMAGE = "/brand/club-crest-etsv-lauda.png";

/**
 * Mitglieder-Banner im Footer (337×175 auf dem Desktop, volle Breite mobil).
 *
 * Aufbau: Wappen als Hintergrund, darueber der Verlauf aus dem Design, damit
 * der Text auf jedem Motiv lesbar bleibt. Fehlt ein Ziel, bleibt der Kasten
 * stehen — nur eben ohne Verlinkung.
 */
export function MemberBanner({ card, membershipUrl, className }: MemberBannerProps) {
  const image = isMedia(card?.image) ? card.image : null;
  const href = resolveHref(card?.link) ?? membershipUrl?.trim() ?? null;
  const preHeadline = card?.preHeadline ?? strings.footer.memberPreHeadline;
  const headline = card?.headline ?? strings.footer.memberHeadline;

  const content = (
    <>
      <Image
        src={image?.url ?? FALLBACK_IMAGE}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 337px"
        className="object-contain"
      />
      <span aria-hidden="true" className="bg-member-gradient absolute inset-0" />

      <span className="relative flex h-full flex-col justify-end gap-1 p-4">
        <span className="flex items-center gap-[9px]">
          <span aria-hidden="true" className="bg-secondary h-[10px] w-[26px] shrink-0" />
          <span className="text-fg-primary text-[12px] leading-5 uppercase">{preHeadline}</span>
        </span>

        <span className="flex items-center justify-between gap-4">
          <span className="label-italic text-fg-primary max-w-[140px] text-[18px] leading-[1.2]">
            {headline}
          </span>
          {href ? <ExternalLinkIcon className="text-secondary shrink-0" /> : null}
        </span>
      </span>
    </>
  );

  const shellClass = cn(
    "bg-background-dark relative block h-[122px] w-full overflow-hidden md:h-[175px] md:w-[337px]",
    className,
  );

  if (!href) {
    return <div className={shellClass}>{content}</div>;
  }

  return (
    <Link href={href} {...externalLinkProps(href)} className={cn(shellClass, "group")}>
      {content}
    </Link>
  );
}
