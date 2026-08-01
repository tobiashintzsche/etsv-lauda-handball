import type { Metadata } from "next";
import Link from "next/link";

import { strings } from "@/lib/strings";
import { CONTAINER } from "@/lib/utils";

/**
 * Eine 404-Seite hat in keinem Index etwas verloren. Der Statuscode allein
 * genuegt dafuer nicht — Suchmaschinen folgen trotzdem Links auf die Seite.
 */
export const metadata: Metadata = {
  title: strings.errors.notFoundTitle,
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className={`${CONTAINER} flex min-h-[60vh] flex-col justify-center py-16`}>
      <p className="heading-italic text-secondary text-[18px] md:text-[24px]">404</p>
      <h1 className="heading-italic mt-1 text-[32px] md:text-[40px]">
        {strings.errors.notFoundTitle}
      </h1>
      <p className="text-muted mt-4 max-w-[560px] text-[16px] leading-[1.5]">
        {strings.errors.notFoundText}
      </p>
      <Link
        href="/"
        className="label-italic bg-secondary text-fg-secondary mt-8 inline-flex h-[44px] w-fit items-center px-6 text-[16px] uppercase transition-opacity hover:opacity-90"
      >
        {strings.errors.notFoundCta}
      </Link>
    </div>
  );
}
