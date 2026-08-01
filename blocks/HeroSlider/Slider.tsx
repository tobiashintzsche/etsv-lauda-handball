"use client";

import Image from "next/image";
import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";
import { ROUTES } from "@/lib/paths";
import { strings } from "@/lib/strings";
import { CONTAINER, cn } from "@/lib/utils";

import { useHeroSlider } from "./use-hero-slider";

export type HeroSlide = {
  href: string;
  title: string;
  /** Category (or, without one, the publication date) — content of the chip. */
  chip: string;
  imageUrl: string;
  imageAlt: string;
};

type HeroSliderTrackProps = {
  slides: HeroSlide[];
  anchorId?: string | null;
};

/**
 * Bildband der Startseite.
 *
 * Aufbau von unten nach oben: das Bild fuellt einen breiten Rahmen (bis 1440px,
 * also deutlich breiter als die 1024px der Abschnitte darunter), darueber ein
 * Verlauf ins Marineblau, darauf links der gelbe Kategorie-Chip und der Titel
 * im dunklen Kasten, darunter die Dots und der Button „Alle News“.
 *
 * Chip, Titel und Bedienleiste liegen bewusst NICHT im Bildrahmen, sondern in
 * einer eigenen absoluten Ebene ueber dem <section>: nur so sitzen sie auf
 * demselben 1024px-Raster wie jeder folgende Abschnitt.
 */
export function HeroSliderTrack({ slides, anchorId }: HeroSliderTrackProps) {
  const { trackRef, active, goTo, pause, resume } = useHeroSlider(slides.length);
  const current = slides[Math.min(active, slides.length - 1)] ?? slides[0];

  return (
    <section
      {...(anchorId && { id: anchorId })}
      aria-roledescription="Karussell"
      aria-label={strings.hero.label}
      className="bg-primary text-fg-primary relative"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <div className="mx-auto w-full max-w-[1440px] md:px-6">
        <div
          ref={trackRef}
          className={cn(
            "flex h-[440px] w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden",
            "overscroll-x-contain sm:h-[500px] md:h-[clamp(460px,62vh,680px)]",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.href}
              role="group"
              aria-roledescription="Folie"
              aria-label={strings.hero.slide(index + 1, slides.length)}
              className="relative h-full w-full shrink-0 snap-start"
            >
              <Image
                src={slide.imageUrl}
                alt={slide.imageAlt}
                fill
                sizes="100vw"
                priority={index === 0}
                className="object-cover"
              />
              {/* Verlauf nur so kraeftig, wie die Kante zum Abschnitt darunter
                  ihn braucht — Chip, Kasten und Bedienleiste bringen ihre
                  eigene Flaeche mit, das Foto soll sichtbar bleiben. */}
              <div
                aria-hidden="true"
                className="from-primary via-primary/35 absolute inset-0 bg-gradient-to-t from-4% via-40% to-transparent to-85%"
              />
              <Link
                href={slide.href}
                aria-label={slide.title}
                tabIndex={index === active ? 0 : -1}
                className="absolute inset-0"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 pb-5 md:pb-8">
        <div className={CONTAINER}>
          <p className="bg-secondary text-fg-secondary heading-italic inline-block -skew-x-12 px-3 py-[3px] text-[13px] md:px-4 md:py-1 md:text-[15px]">
            <span className="inline-block skew-x-12">{current.chip}</span>
          </p>

          <p className="bg-primary text-fg-primary mt-2 line-clamp-3 max-w-[680px] px-4 py-3 font-sans text-[22px] leading-[1.15] font-bold md:mt-2.5 md:px-6 md:py-4 md:text-[36px] md:leading-[1.08]">
            {current.title}
          </p>

          <div className="mt-4 flex items-center justify-between gap-4 md:mt-6 md:grid md:grid-cols-[1fr_auto_1fr]">
            <div className="flex items-center gap-2 md:col-start-2 md:gap-3">
              {slides.map((slide, index) => (
                <button
                  key={slide.href}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={strings.hero.slide(index + 1, slides.length)}
                  aria-current={index === active}
                  className="pointer-events-auto flex h-6 items-center"
                >
                  <span
                    className={cn(
                      "block h-[8px] w-[36px] transition-colors md:h-[10px] md:w-[48px]",
                      index === active ? "bg-secondary" : "bg-line hover:bg-muted",
                    )}
                  />
                </button>
              ))}
            </div>

            <Link
              href={ROUTES.news}
              className="bg-secondary text-fg-secondary heading-italic hover:bg-fg-primary pointer-events-auto inline-block -skew-x-12 px-4 py-2 text-[15px] transition-colors md:col-start-3 md:justify-self-end md:px-6 md:py-2.5 md:text-[18px]"
            >
              <span className="flex skew-x-12 items-center gap-2">
                {strings.hero.allNews}
                <ArrowRightIcon className="shrink-0" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
