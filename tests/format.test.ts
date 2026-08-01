import { describe, expect, it } from "vitest";

import {
  formatDate,
  formatDateTime,
  formatGameDate,
  formatTime,
  formatTimeRange,
  formatWeekday,
  toIsoDate,
} from "@/lib/format";

/**
 * Alle Erwartungen sind gegen Europe/Berlin formuliert — die Funktionen pinnen
 * die Zeitzone selbst, deshalb muessen die Tests auf einem Rechner in einer
 * anderen Zone identisch durchlaufen.
 *
 * 27.07.2026 ist ein Montag, Sommerzeit (UTC+2).
 * 06.01.2026 ist ein Dienstag, Winterzeit (UTC+1).
 */
const SUMMER_EVENING = "2026-07-27T17:30:00.000Z"; // 19:30 Ortszeit
const WINTER_LATE = "2026-01-06T22:30:00.000Z"; // 23:30 Ortszeit, gleicher Tag
const WINTER_ROLLOVER = "2026-01-06T23:30:00.000Z"; // 00:30 Ortszeit am 07.01.

describe("formatDate", () => {
  it("renders DD.MM.YYYY", () => {
    expect(formatDate(SUMMER_EVENING)).toBe("27.07.2026");
  });

  it("zero-pads day and month", () => {
    expect(formatDate("2026-01-06T12:00:00.000Z")).toBe("06.01.2026");
    expect(formatDate("2026-09-05T12:00:00.000Z")).toBe("05.09.2026");
  });

  it("accepts a Date instance", () => {
    expect(formatDate(new Date(SUMMER_EVENING))).toBe("27.07.2026");
  });

  it("shifts to Berlin time — UTC late evening is still the same local day in winter", () => {
    expect(formatDate(WINTER_LATE)).toBe("06.01.2026");
  });

  it("rolls over to the next local day when Berlin is already past midnight", () => {
    expect(formatDate(WINTER_ROLLOVER)).toBe("07.01.2026");
  });

  it("returns an empty string for missing or unparsable values", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("")).toBe("");
    expect(formatDate("kein datum")).toBe("");
  });
});

describe("formatDateTime", () => {
  it("renders DD.MM.YYYY, HH:MM", () => {
    expect(formatDateTime(SUMMER_EVENING)).toBe("27.07.2026, 19:30");
  });

  it("uses winter time offsets in January", () => {
    expect(formatDateTime(WINTER_LATE)).toBe("06.01.2026, 23:30");
  });

  it("returns an empty string for missing values", () => {
    expect(formatDateTime(null)).toBe("");
    expect(formatDateTime("nope")).toBe("");
  });
});

describe("formatTime", () => {
  it("renders 24h HH:MM", () => {
    expect(formatTime(SUMMER_EVENING)).toBe("19:30");
    expect(formatTime(WINTER_ROLLOVER)).toBe("00:30");
  });

  it("returns an empty string for missing values", () => {
    expect(formatTime(undefined)).toBe("");
  });
});

describe("formatGameDate", () => {
  it('renders "Mo, 27.07.2026 · 19:30 Uhr"', () => {
    expect(formatGameDate(SUMMER_EVENING)).toBe("Mo, 27.07.2026 · 19:30 Uhr");
  });

  it("uses the German short weekday of the local day", () => {
    // 07.01.2026 ist ein Mittwoch.
    expect(formatGameDate(WINTER_ROLLOVER)).toBe("Mi, 07.01.2026 · 00:30 Uhr");
    // 05.09.2026 ist ein Samstag — der klassische Handball-Spieltag.
    expect(formatGameDate("2026-09-05T16:00:00.000Z")).toBe("Sa, 05.09.2026 · 18:00 Uhr");
  });

  it("returns an empty string for missing values", () => {
    expect(formatGameDate(null)).toBe("");
    expect(formatGameDate("irgendwas")).toBe("");
  });
});

describe("toIsoDate", () => {
  it("returns the ISO string", () => {
    expect(toIsoDate(SUMMER_EVENING)).toBe("2026-07-27T17:30:00.000Z");
  });

  it("returns an empty string for missing values", () => {
    expect(toIsoDate(null)).toBe("");
    expect(toIsoDate("kaputt")).toBe("");
  });
});

describe("formatWeekday", () => {
  it("maps the select values to full German weekday names", () => {
    expect(formatWeekday("mo")).toBe("Montag");
    expect(formatWeekday("di")).toBe("Dienstag");
    expect(formatWeekday("mi")).toBe("Mittwoch");
    expect(formatWeekday("do")).toBe("Donnerstag");
    expect(formatWeekday("fr")).toBe("Freitag");
    expect(formatWeekday("sa")).toBe("Samstag");
    expect(formatWeekday("so")).toBe("Sonntag");
  });

  it("falls back to the raw value for unknown keys", () => {
    expect(formatWeekday("xx")).toBe("xx");
  });

  it("returns an empty string for missing values", () => {
    expect(formatWeekday(null)).toBe("");
    expect(formatWeekday(undefined)).toBe("");
    expect(formatWeekday("")).toBe("");
  });
});

describe("formatTimeRange", () => {
  it("renders from–to with an en dash", () => {
    expect(formatTimeRange("18:30", "20:00")).toBe("18:30 – 20:00 Uhr");
  });

  it("renders only the start when no end time is set", () => {
    expect(formatTimeRange("18:30")).toBe("18:30 Uhr");
    expect(formatTimeRange("18:30", null)).toBe("18:30 Uhr");
  });

  it("returns an empty string without a start time", () => {
    expect(formatTimeRange(null, "20:00")).toBe("");
    expect(formatTimeRange()).toBe("");
  });
});
