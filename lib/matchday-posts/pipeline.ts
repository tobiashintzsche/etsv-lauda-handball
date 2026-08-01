import type { Payload } from "payload";

import { generateDrafts } from "./generate";
import { collectFixtures } from "./source";
import { type SyncSummary, payloadRepository, syncDrafts } from "./sync";

/**
 * The pipeline end to end: read fixtures → build proposals → write them.
 *
 * Used by `pnpm posts:generate` and by the admin endpoint, so both take exactly
 * the same path. Nothing in here decides anything — the decisions live in
 * `generate.ts` (what to propose) and `sync.ts` (what to write).
 */

/** Two weeks ahead is what the club plans in. Override per run when needed. */
export const DEFAULT_WINDOW_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

export type PipelineOptions = {
  /** Start of the window. Defaults to now. */
  from?: Date;
  /** Length of the window in days. Ignored when `to` is given. */
  days?: number;
  /** Explicit end of the window. */
  to?: Date;
  /** Ask handball.net first. Off for offline runs. */
  useLive?: boolean;
  /** Set by the CLI: outside a Next.js request scope no cache tag can be purged. */
  disableRevalidate?: boolean;
};

export type PipelineResult = SyncSummary & {
  window: { from: string; to: string; days: number };
  fixtureCount: number;
  tiers: { live: number; collection: number };
};

/** Normalises the three ways of expressing a window into `from`/`to`. */
export function resolveWindow(options: PipelineOptions = {}) {
  const from = options.from ?? new Date();
  const days = options.days ?? DEFAULT_WINDOW_DAYS;
  const to = options.to ?? new Date(from.getTime() + days * DAY_MS);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
    days: Math.max(0, Math.round((to.getTime() - from.getTime()) / DAY_MS)),
  };
}

export async function runMatchdayPipeline(
  payload: Payload,
  options: PipelineOptions = {},
): Promise<PipelineResult> {
  const window = resolveWindow(options);

  const { fixtures, tiers } = await collectFixtures(payload, {
    from: window.from,
    to: window.to,
    useLive: options.useLive,
  });

  const drafts = generateDrafts(fixtures);
  const repository = payloadRepository(payload, { disableRevalidate: options.disableRevalidate });
  const summary = await syncDrafts(repository, drafts);

  return { ...summary, window, fixtureCount: fixtures.length, tiers };
}
