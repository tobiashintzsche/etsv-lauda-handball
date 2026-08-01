import { describe, expect, it } from "vitest";

import { generateDrafts } from "@/lib/matchday-posts/generate";
import { type ExistingPost, type PostsRepository, syncDrafts } from "@/lib/matchday-posts/sync";
import type {
  MatchdayPostDraft,
  MatchdayPostStatus,
  SourceFixture,
} from "@/lib/matchday-posts/types";

/**
 * Die Schreibregeln der Pipeline: neu anlegen, Vorschlaege aktualisieren,
 * Entscheidungen der Redaktion niemals ueberschreiben.
 */

const KICKOFF = "2026-09-19T16:00:00+02:00";

function fixture(overrides: Partial<SourceFixture> = {}): SourceFixture {
  return {
    sourceGameId: "game:1",
    kickoff: KICKOFF,
    homeTeam: "Männer",
    awayTeam: "TV Hardheim 1895",
    isOwnHome: true,
    venue: "Sporthalle Lauda",
    league: "Bezirksklasse Gruppe 1",
    ...overrides,
  };
}

/** In-Memory-Repository — dieselben Regeln, keine Datenbank. */
function repository(seed: ExistingPost[] = []) {
  const stored = new Map<string, ExistingPost>();
  const drafts = new Map<string, MatchdayPostDraft>();
  const calls: string[] = [];

  return {
    calls,
    stored,
    seedDraft(sourceKey: string, draft: MatchdayPostDraft, status: MatchdayPostStatus) {
      drafts.set(sourceKey, draft);
      stored.set(sourceKey, {
        id: stored.size + 1,
        status,
        title: draft.title,
        postType: draft.postType,
        matchday: { dateFrom: draft.dateFrom, dateTo: draft.dateTo },
        games: draft.games,
      });
    },
    repo: {
      async findBySourceKey(sourceKey) {
        return stored.get(sourceKey) ?? seed.find(() => false) ?? null;
      },
      async create(draft) {
        calls.push(`create:${draft.sourceKey}`);
        const doc: ExistingPost = {
          id: stored.size + 1,
          status: "vorschlag",
          title: draft.title,
          postType: draft.postType,
          matchday: { dateFrom: draft.dateFrom, dateTo: draft.dateTo },
          games: draft.games,
        };
        stored.set(draft.sourceKey, doc);
        drafts.set(draft.sourceKey, draft);
        return { id: doc.id };
      },
      async update(id, draft) {
        calls.push(`update:${draft.sourceKey}`);
        stored.set(draft.sourceKey, {
          id,
          status: stored.get(draft.sourceKey)?.status ?? "vorschlag",
          title: draft.title,
          postType: draft.postType,
          matchday: { dateFrom: draft.dateFrom, dateTo: draft.dateTo },
          games: draft.games,
        });
      },
    } satisfies PostsRepository,
  };
}

describe("syncDrafts", () => {
  it("legt neue Vorschlaege an", async () => {
    const { repo, calls } = repository();
    const summary = await syncDrafts(repo, generateDrafts([fixture()]));

    expect(summary.created).toBe(1);
    expect(summary.entries[0].outcome).toBe("created");
    expect(calls).toEqual(["create:" + summary.entries[0].sourceKey]);
  });

  it("schreibt beim zweiten Lauf nichts — Idempotenz", async () => {
    const { repo, calls } = repository();
    const drafts = generateDrafts([fixture()]);

    await syncDrafts(repo, drafts);
    calls.length = 0;
    const second = await syncDrafts(repo, generateDrafts([fixture()]));

    expect(second.created).toBe(0);
    expect(second.updated).toBe(0);
    expect(second.unchanged).toBe(1);
    expect(calls).toEqual([]);
  });

  it("aktualisiert einen Vorschlag, wenn sich die Anwurfzeit aendert", async () => {
    const { repo, calls } = repository();
    const [draft] = generateDrafts([fixture()]);
    await syncDrafts(repo, [draft]);
    calls.length = 0;

    // Gleiche Spiel-Id, neue Uhrzeit → gleicher sourceKey, neuer Inhalt.
    const moved = generateDrafts([fixture({ kickoff: "2026-09-19T18:00:00+02:00" })]);
    expect(moved[0].sourceKey).toBe(draft.sourceKey);

    const summary = await syncDrafts(repo, moved);
    expect(summary.updated).toBe(1);
    expect(calls).toEqual([`update:${draft.sourceKey}`]);
  });

  it("fasst freigegebene Posts nicht an", async () => {
    const store = repository();
    const [draft] = generateDrafts([fixture()]);
    store.seedDraft(draft.sourceKey, draft, "freigegeben");
    store.calls.length = 0;

    const moved = generateDrafts([fixture({ kickoff: "2026-09-19T18:00:00+02:00" })]);
    const summary = await syncDrafts(store.repo, moved);

    expect(summary.protected).toBe(1);
    expect(summary.entries[0].status).toBe("freigegeben");
    expect(store.calls).toEqual([]);
  });

  it("fasst verworfene Posts nicht an — auch nicht bei gleichem Inhalt", async () => {
    const store = repository();
    const [draft] = generateDrafts([fixture()]);
    store.seedDraft(draft.sourceKey, draft, "verworfen");
    store.calls.length = 0;

    const summary = await syncDrafts(store.repo, [draft]);
    expect(summary.protected).toBe(1);
    expect(summary.unchanged).toBe(0);
    expect(store.calls).toEqual([]);
  });

  it("zaehlt gemischte Ergebnisse korrekt", async () => {
    const store = repository();
    const drafts = generateDrafts([
      fixture({ sourceGameId: "game:1" }),
      fixture({ sourceGameId: "game:2", kickoff: "2026-09-26T16:00:00+02:00" }),
    ]);
    store.seedDraft(drafts[0].sourceKey, drafts[0], "freigegeben");

    const summary = await syncDrafts(store.repo, drafts);
    expect({
      created: summary.created,
      protected: summary.protected,
      updated: summary.updated,
    }).toEqual({ created: 1, protected: 1, updated: 0 });
  });
});
