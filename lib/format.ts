/**
 * Date and number formatting. Everything is German locale, Europe/Berlin —
 * this site has exactly one audience.
 */

const TIME_ZONE = "Europe/Berlin";

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "27.07.2026" */
export function formatDate(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
}

/** "27.07.2026, 19:30" */
export function formatDateTime(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(date);
}

/** "19:30" */
export function formatTime(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(date);
}

/** "Sa, 27.07.2026 · 19:30 Uhr" — the fixture list format. */
export function formatGameDate(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "";
  const weekday = new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    timeZone: TIME_ZONE,
  }).format(date);
  return `${weekday}, ${formatDate(date)} · ${formatTime(date)} Uhr`;
}

/** ISO date (YYYY-MM-DD) for `<time dateTime>` and structured data. */
export function toIsoDate(value: string | Date | null | undefined): string {
  const date = toDate(value);
  return date ? date.toISOString() : "";
}

/** Weekday select value → full German name. Mirrors `WEEKDAYS` in collections/Teams.ts. */
const WEEKDAY_LABELS: Record<string, string> = {
  mo: "Montag",
  di: "Dienstag",
  mi: "Mittwoch",
  do: "Donnerstag",
  fr: "Freitag",
  sa: "Samstag",
  so: "Sonntag",
};

export function formatWeekday(value: string | null | undefined): string {
  if (!value) return "";
  return WEEKDAY_LABELS[value] ?? value;
}

/** "18:30 – 20:00 Uhr" */
export function formatTimeRange(from?: string | null, to?: string | null): string {
  if (!from) return "";
  return to ? `${from} – ${to} Uhr` : `${from} Uhr`;
}
