import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Media } from "@payload-types";

/** Merge Tailwind classes without duplicate/conflicting utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Type guard for a populated upload relationship. Payload returns either the
 * full doc (depth >= 1) or a bare id — every render path must check.
 */
export function isMedia(value: unknown): value is Media {
  return typeof value === "object" && value !== null && "url" in value;
}

/** Populated relationship of any collection, as opposed to a bare id. */
export function isPopulated<T extends object>(value: unknown): value is T {
  return typeof value === "object" && value !== null && "id" in value;
}

/**
 * Horizontal container shared by every section. The design fixes the content
 * width at 1024px — do not vary it per block.
 */
export const CONTAINER = "mx-auto w-full max-w-[1024px] px-4";

/**
 * Narrow container for article bodies. The design puts the text column at
 * 690px; `max-w` carries the 2×16px gutter on top, exactly like `CONTAINER`
 * (1024 = 992 content + gutter). Measured against the Figma export: title and
 * cover image start at x=295 in a 1280px frame and are 690px wide.
 */
export const CONTAINER_ARTICLE = "mx-auto w-full max-w-[722px] px-4";

/** Vertical rhythm of a section: 32px on mobile, 64px from md up. */
export const SECTION_PADDING = "py-8 md:py-16";
