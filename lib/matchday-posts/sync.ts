import type { Payload } from "payload";

import type { MatchdayPostDraft, MatchdayPostGame, MatchdayPostStatus } from "./types";

/**
 * Writing proposals into Payload, idempotently.
 *
 * Three rules, in this order:
 *
 *   1. a `sourceKey` that does not exist yet becomes a new `vorschlag`
 *   2. an existing `vorschlag` is refreshed when its content drifted, and left
 *      untouched when it did not — running the pipeline twice creates nothing
 *   3. `freigegeben` and `verworfen` are NEVER written to. The editor has made
 *      a decision; the pipeline does not get to undo it
 *
 * The repository indirection keeps the rules unit-testable without a database.
 */

export type SyncOutcome = "created" | "updated" | "unchanged" | "protected";

export type ExistingPost = {
  id: string | number;
  status: MatchdayPostStatus;
  title?: string | null;
  postType?: string | null;
  matchday?: { dateFrom?: string | null; dateTo?: string | null } | null;
  games?: MatchdayPostGame[] | null;
};

export type PostsRepository = {
  findBySourceKey: (sourceKey: string) => Promise<ExistingPost | null>;
  create: (draft: MatchdayPostDraft) => Promise<{ id: string | number }>;
  update: (id: string | number, draft: MatchdayPostDraft) => Promise<void>;
};

export type SyncEntry = {
  sourceKey: string;
  title: string;
  postType: MatchdayPostDraft["postType"];
  gameCount: number;
  outcome: SyncOutcome;
  id?: string | number;
  /** Set for `protected` — which decision blocked the write. */
  status?: MatchdayPostStatus;
};

export type SyncSummary = {
  created: number;
  updated: number;
  unchanged: number;
  protected: number;
  entries: SyncEntry[];
};

/** Only these fields are pipeline-owned; variant, caption edits and overlays are not. */
function fingerprint(source: {
  title?: string | null;
  postType?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  games?: MatchdayPostGame[] | null;
}): string {
  const games = (source.games ?? []).map((game) => [
    game.time ?? "",
    new Date(game.date).toISOString(),
    game.homeTeam ?? "",
    game.awayTeam ?? "",
    game.venue ?? "",
    game.league ?? "",
    game.isOwnHome ? "H" : "A",
    game.sourceGameId ?? "",
  ]);

  return JSON.stringify([
    source.title ?? "",
    source.postType ?? "",
    source.dateFrom ? new Date(source.dateFrom).toISOString() : "",
    source.dateTo ? new Date(source.dateTo).toISOString() : "",
    games,
  ]);
}

/** Statuses the pipeline must not overwrite. */
const PROTECTED_STATUS: readonly MatchdayPostStatus[] = ["freigegeben", "verworfen"];

function isProtected(status: MatchdayPostStatus): boolean {
  return PROTECTED_STATUS.includes(status);
}

/** Applies the three rules to one draft. */
export async function syncDraft(
  repository: PostsRepository,
  draft: MatchdayPostDraft,
): Promise<SyncEntry> {
  const base = {
    sourceKey: draft.sourceKey,
    title: draft.title,
    postType: draft.postType,
    gameCount: draft.games.length,
  };

  const existing = await repository.findBySourceKey(draft.sourceKey);

  if (!existing) {
    const created = await repository.create(draft);
    return { ...base, outcome: "created", id: created.id };
  }

  if (isProtected(existing.status)) {
    return { ...base, outcome: "protected", id: existing.id, status: existing.status };
  }

  const before = fingerprint({
    title: existing.title,
    postType: existing.postType,
    dateFrom: existing.matchday?.dateFrom,
    dateTo: existing.matchday?.dateTo,
    games: existing.games,
  });

  if (before === fingerprint(draft)) {
    return { ...base, outcome: "unchanged", id: existing.id };
  }

  await repository.update(existing.id, draft);
  return { ...base, outcome: "updated", id: existing.id };
}

/** Applies the rules to every draft and counts the outcomes. */
export async function syncDrafts(
  repository: PostsRepository,
  drafts: readonly MatchdayPostDraft[],
): Promise<SyncSummary> {
  const entries: SyncEntry[] = [];
  for (const draft of drafts) entries.push(await syncDraft(repository, draft));

  return {
    created: entries.filter((e) => e.outcome === "created").length,
    updated: entries.filter((e) => e.outcome === "updated").length,
    unchanged: entries.filter((e) => e.outcome === "unchanged").length,
    protected: entries.filter((e) => e.outcome === "protected").length,
    entries,
  };
}

/** Draft → collection fields. `status` stays out of updates on purpose. */
function toDocument(draft: MatchdayPostDraft) {
  return {
    title: draft.title,
    postType: draft.postType,
    matchday: { dateFrom: draft.dateFrom, dateTo: draft.dateTo },
    games: draft.games,
    caption: draft.caption,
    sourceKey: draft.sourceKey,
  };
}

export type RepositoryOptions = {
  /**
   * Skip the cache-purge hooks. The CLI run has no Next.js request scope, so
   * `revalidateTag` would throw there — the admin endpoint does have one and
   * must purge.
   */
  disableRevalidate?: boolean;
};

/** The real repository, backed by the Payload local API. */
export function payloadRepository(
  payload: Payload,
  options: RepositoryOptions = {},
): PostsRepository {
  const context = { disableRevalidate: options.disableRevalidate === true };

  return {
    async findBySourceKey(sourceKey) {
      const result = await payload.find({
        collection: "matchdayPosts",
        where: { sourceKey: { equals: sourceKey } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      });
      const doc = result.docs[0];
      if (!doc) return null;

      return {
        id: doc.id,
        status: doc.status as MatchdayPostStatus,
        title: doc.title,
        postType: doc.postType,
        matchday: doc.matchday,
        games: (doc.games ?? []) as MatchdayPostGame[],
      };
    },

    async create(draft) {
      const doc = await payload.create({
        collection: "matchdayPosts",
        data: { ...toDocument(draft), status: "vorschlag", variant: "standard" },
        overrideAccess: true,
        context,
      });
      return { id: doc.id };
    },

    async update(id, draft) {
      await payload.update({
        collection: "matchdayPosts",
        id,
        data: toDocument(draft),
        overrideAccess: true,
        context,
      });
    },
  };
}
