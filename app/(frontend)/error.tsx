"use client";

import Link from "next/link";
import { useEffect } from "react";

import { strings } from "@/lib/strings";
import { CONTAINER } from "@/lib/utils";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Auffangnetz fuer Render-Fehler im Frontend.
 *
 * `reset()` rendert das Segment neu — bei einem kurzzeitig nicht erreichbaren
 * handball.net oder einer haengenden Datenbankverbindung reicht das oft schon.
 * Der Fehler landet zusaetzlich in der Konsole, damit er in den Server-Logs
 * auftaucht.
 */
export default function FrontendError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={`${CONTAINER} flex min-h-[60vh] flex-col justify-center py-16`}>
      <p className="heading-italic text-secondary text-[18px] md:text-[24px]">Fehler</p>
      <h1 className="mt-1 text-[32px] md:text-[40px]">{strings.errors.genericTitle}</h1>
      <p className="text-muted mt-4 max-w-[560px] text-[16px] leading-[1.5]">
        {strings.errors.genericText}
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={reset}
          className="label-italic bg-secondary text-fg-secondary inline-flex h-[44px] items-center px-6 text-[16px] uppercase transition-opacity hover:opacity-90"
        >
          {strings.errors.retry}
        </button>
        <Link
          href="/"
          className="label-italic text-fg-primary hover:border-secondary inline-flex h-[44px] items-center border border-white px-6 text-[16px] uppercase transition-colors"
        >
          {strings.errors.notFoundCta}
        </Link>
      </div>
    </div>
  );
}
