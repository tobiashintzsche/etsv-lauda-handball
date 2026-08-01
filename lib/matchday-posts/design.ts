/**
 * Design constants of the Instagram matchday post.
 *
 * Source: the Figma spec (screens 2005:1386 … 2006:1519), NOT eyeballed from a
 * screenshot. Every value is the measured px value of the 1080×1350 canvas.
 *
 * The post deliberately uses its own navy/yellow (#19213B / #FCC105) instead of
 * the website tokens (#1A213B / #FDC52C): the exported PNG has to match the
 * Figma original, and the difference is invisible to the eye (ΔE < 1).
 *
 * Both renderers — the HTML route and the next/og PNG route — read from here,
 * so there is exactly one place that knows the geometry.
 */

/** Instagram portrait 4:5. */
export const POST_SIZE = { width: 1080, height: 1350 } as const;

export const POST_COLORS = {
  navy: "#19213B",
  yellow: "#FCC105",
  white: "#FFFFFF",
  black: "#000000",
} as const;

/** All spacing and type sizes of the canvas, in design px. */
export const POST_METRICS = {
  /** Asymmetric on purpose: the badge sits flush at x=48, content at x=80. */
  paddingTop: 80,
  paddingRight: 80,
  paddingBottom: 80,
  paddingLeft: 48,
  /** Extra indent of everything below the badge (48 + 32 = 80). */
  contentIndent: 32,
  /** The one vertical rhythm value of the whole design. */
  gap: 40,

  badgeFontSize: 100,
  badgeLineHeight: 151,
  badgePaddingY: 8,
  badgePaddingX: 32,

  dayFontSize: 72,
  /**
   * 108px is the height Figma reports INCLUDING the 2px underline. Keeping the
   * line box at 108 puts the glyphs where the original has them; the border is
   * pulled back into the box with `dayUnderlineOffset` so the rows below do not
   * slip by 2px. Verified pixel by pixel against `screen3-flat-export`.
   */
  dayLineHeight: 108,
  dayUnderlineWidth: 2,
  dayUnderlineOffset: -2,

  rowFontSize: 40,
  rowLineHeight: 60,
  /** 84px is the newer five-row variant; the 80px screens are tolerated drift. */
  valueFontSize: 84,
  valueLineHeight: 126,
  /** Horizontal gap between the team block and the time/result column. */
  rowGap: 80,

  /** Photo variant: the kick-off moves into the header next to the badge. */
  overlayTimeFontSize: 100,
  overlayLineTop: 257,
  overlayLineLeft: 80,
} as const;

export const POST_ASSETS = {
  /** Navy + court lines + claw, pre-composed and pixel-verified against Figma. */
  background: "/brand/spieltagspost/bg-plate-1080x1350.png",
  /** White claw for the photo variant, laid over the header at 20 % opacity. */
  claw: "/brand/spieltagspost/kratzer-claw-white.png",
  /** Anton TTF — next/og needs a real TrueType buffer, woff2 is not readable. */
  font: "/fonts/Anton-Regular.ttf",
} as const;

/** Claw placement of the photo variant (§7.4) — different from the plate. */
export const OVERLAY_CLAW = {
  left: 650,
  top: -25,
  size: 527.805,
  rotation: 93.74,
  opacity: 0.2,
} as const;

/** Darkening gradient over the photo (§7.3), paint opacity already folded in. */
export const OVERLAY_GRADIENT =
  "linear-gradient(178.498deg, rgba(0,0,0,0.75) 27.329%, rgba(0,0,0,0) 46.714%)";

/** Drop shadow of the kick-off time in the photo variant. */
export const OVERLAY_TIME_SHADOW = "0px 4px 4px rgba(0, 0, 0, 0.25)";

/** Roughly the crop of the Figma photo — good enough for any new photo (§7.2). */
export const OVERLAY_PHOTO_POSITION = "62% 10%";

/**
 * How many game rows fit on one screen, by number of headline groups.
 *
 * Usable height 1190px − badge (167 + 40) − per group (108 + 40) − per row
 * (126 + 40). Six rows in one group would need 1311px and overflow.
 */
export const MAX_ROWS_BY_GROUPS: Record<number, number> = { 1: 5, 2: 4, 3: 2 };

/** Fallback for the (practically impossible) case of more than three groups. */
const MAX_ROWS_FALLBACK = 2;

/** Maximum rows a post with `groupCount` headline groups may carry. */
export function maxRowsForGroups(groupCount: number): number {
  return MAX_ROWS_BY_GROUPS[groupCount] ?? MAX_ROWS_FALLBACK;
}
