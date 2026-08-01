/**
 * Calendar helpers for the matchday pipeline.
 *
 * Every grouping decision (which weekend, which day headline, which kick-off
 * time) has to be made in the club's local time, never in the server's. A
 * fixture at 00:30 CEST is a Saturday game in Lauda and a Friday game in UTC —
 * the clustering would silently split a matchday in two. Hence: one fixed time
 * zone, all formatting through `Intl` with an explicit `timeZone`.
 */

export const POST_TIME_ZONE = "Europe/Berlin";

const DAY_MS = 24 * 60 * 60 * 1000;

const isoDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: POST_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("de-DE", {
  timeZone: POST_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const weekdayLongFormatter = new Intl.DateTimeFormat("de-DE", {
  timeZone: POST_TIME_ZONE,
  weekday: "long",
});

const weekdayShortFormatter = new Intl.DateTimeFormat("de-DE", {
  timeZone: POST_TIME_ZONE,
  weekday: "short",
});

const germanDateFormatter = new Intl.DateTimeFormat("de-DE", {
  timeZone: POST_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** ISO weekday index in Berlin time: 1 = Monday … 7 = Sunday. */
const ISO_WEEKDAY: Record<string, number> = { Mo: 1, Di: 2, Mi: 3, Do: 4, Fr: 5, Sa: 6, So: 7 };

function toDate(iso: string): Date {
  return new Date(iso);
}

/** Calendar day in Berlin as `YYYY-MM-DD` — the key everything groups by. */
export function berlinDateKey(iso: string): string {
  return isoDateFormatter.format(toDate(iso));
}

/** Kick-off as `HH:MM`, 24h, leading zero. */
export function berlinTime(iso: string): string {
  return timeFormatter.format(toDate(iso));
}

/** ISO weekday of a timestamp in Berlin time (1 = Monday … 7 = Sunday). */
export function berlinWeekday(iso: string): number {
  const short = weekdayShortFormatter.format(toDate(iso)).replace(".", "");
  return ISO_WEEKDAY[short] ?? 1;
}

/** Full German weekday, e.g. `Samstag`. The post renders it uppercase. */
export function berlinWeekdayName(iso: string): string {
  return weekdayLongFormatter.format(toDate(iso));
}

/** Short German weekday without the trailing period, e.g. `Sa`. */
export function berlinWeekdayShort(iso: string): string {
  return weekdayShortFormatter.format(toDate(iso)).replace(".", "");
}

/** German date, e.g. `19.09.2026`. */
export function berlinDate(iso: string): string {
  return germanDateFormatter.format(toDate(iso));
}

/**
 * Cluster key of a fixture — the "matchday" it belongs to.
 *
 * Friday to Sunday collapse onto the Friday of that weekend, every other day
 * stands on its own. That mirrors how the club talks about its schedule: a
 * Saturday game and the Sunday game after it are one matchday, a Wednesday
 * catch-up game is not.
 */
export function matchdayKey(iso: string): string {
  const weekday = berlinWeekday(iso);
  const dateKey = berlinDateKey(iso);
  if (weekday < 5) return dateKey;
  return shiftDateKey(dateKey, -(weekday - 5));
}

/** Adds days to a `YYYY-MM-DD` key. Pure calendar math, no time zone involved. */
function shiftDateKey(dateKey: string, days: number): string {
  const shifted = new Date(`${dateKey}T00:00:00Z`).getTime() + days * DAY_MS;
  return new Date(shifted).toISOString().slice(0, 10);
}
