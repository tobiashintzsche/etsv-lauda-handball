"use client";

import { type RefObject, useCallback, useEffect, useRef, useState } from "react";

/**
 * State machine of the hero slider.
 *
 * The track itself is a CSS scroll-snap container — that gives native, inertial
 * swiping on touch devices for free, works before hydration and needs no
 * carousel dependency. This hook only translates between "which slide is in
 * view" and "scroll the track there".
 */

/** Long enough to read a headline, short enough to notice the slider moves. */
const AUTOPLAY_MS = 6000;

/**
 * While a programmatic smooth scroll runs, the browser fires scroll events for
 * every intermediate position. Ignoring them for this long keeps the dots and
 * the headline from flickering back to the slide we are leaving.
 */
const SETTLE_MS = 700;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export type HeroSliderControls = {
  trackRef: RefObject<HTMLDivElement | null>;
  /** Index of the slide currently in view. */
  active: number;
  goTo: (index: number) => void;
  pause: () => void;
  resume: () => void;
};

export function useHeroSlider(count: number): HeroSliderControls {
  const trackRef = useRef<HTMLDivElement>(null);
  const settleUntil = useRef(0);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track || count === 0) return;

      const target = ((index % count) + count) % count;
      settleUntil.current = Date.now() + SETTLE_MS;
      setActive(target);
      track.scrollTo({
        left: target * track.clientWidth,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    },
    [count],
  );

  // Swiping and trackpad scrolling move the dots as well.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (Date.now() < settleUntil.current || track.clientWidth === 0) return;
        setActive(Math.round(track.scrollLeft / track.clientWidth));
      });
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Autoplay stops while the slider is hovered or focused, in a background tab
  // and whenever the visitor asked for reduced motion (WCAG 2.2.2).
  useEffect(() => {
    if (paused || count < 2 || prefersReducedMotion()) return;

    const id = window.setInterval(() => {
      if (document.hidden) return;
      goTo(active + 1);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [active, count, goTo, paused]);

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  return { trackRef, active, goTo, pause, resume };
}
