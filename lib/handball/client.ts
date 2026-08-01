import type {
  HandballEnvelope,
  HandballGameSummary,
  HandballTableResponse,
  HandballTableRow,
} from "./types";

/**
 * Thin server-side fetcher for the public handball.net sportdata API.
 *
 * SERVER ONLY. The API sends no `Access-Control-Allow-Origin`, so a browser
 * fetch is blocked by CORS — every call must happen in an RSC or route handler.
 *
 * Upstream caches for 600s (`max-age=600, s-maxage=600`); polling faster only
 * hits CloudFront, so our revalidate window mirrors it exactly.
 */

const BASE_URL = "https://www.handball.net/a/sportdata/1";
const REVALIDATE_SECONDS = 600;
const REQUEST_TIMEOUT_MS = 5000;

const HEADERS = {
  Accept: "application/json",
  "User-Agent": "etsv-lauda.de/1.0",
};

/**
 * GET one endpoint. Returns `null` for anything that is not a usable payload —
 * 404, network error, timeout, malformed JSON. Callers fall back, they never
 * see an exception: a handball.net outage must not take down a team page.
 */
async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS, tags: ["handball"] },
    });

    if (!response.ok) return null;

    const body = (await response.json()) as HandballEnvelope<T> | null;
    return body?.data ?? null;
  } catch {
    // Swallowed on purpose — see the doc comment above.
    return null;
  }
}

export type TableResult = {
  rows: HandballTableRow[];
  tournamentName: string | null;
};

function toTableResult(data: HandballTableResponse | null): TableResult | null {
  if (!data) return null;
  return {
    rows: Array.isArray(data.rows) ? data.rows : [],
    tournamentName: data.tournament?.name ?? null,
  };
}

/**
 * League table by tournament id (`…m-bk-1-nf_nf`).
 *
 * An empty `rows` array is the normal state before a season starts — that is a
 * successful response, not an error, and the caller decides what to show.
 */
export async function getTable(tournamentId: string): Promise<TableResult | null> {
  if (!tournamentId) return null;
  const data = await fetchJson<HandballTableResponse>(
    `/tournaments/${encodeURIComponent(tournamentId)}/table`,
  );
  return toTableResult(data);
}

/**
 * League table by team id. Handy for past seasons: an old team id returns its
 * closing table without any query parameters, whereas the tournament route
 * answers with an empty row list.
 */
export async function getTeamTable(teamId: string): Promise<TableResult | null> {
  if (!teamId) return null;
  const data = await fetchJson<HandballTableResponse>(`/teams/${encodeURIComponent(teamId)}/table`);
  return toTableResult(data);
}

/**
 * Fixture list of one team.
 *
 * `season=YYYY` does NOT work here (it silently returns an empty list) — the
 * parameter is `tournamentSeason` and expects a phase id.
 */
export async function getTeamSchedule(
  teamId: string,
  tournamentSeason?: string,
): Promise<HandballGameSummary[]> {
  if (!teamId) return [];

  const query = tournamentSeason ? `?tournamentSeason=${encodeURIComponent(tournamentSeason)}` : "";
  const data = await fetchJson<HandballGameSummary[]>(
    `/teams/${encodeURIComponent(teamId)}/schedule${query}`,
  );

  return Array.isArray(data) ? data : [];
}
