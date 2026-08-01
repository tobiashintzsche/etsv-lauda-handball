import { describe, expect, it } from "vitest";

import { mergeFeaturedFirst } from "@/lib/news-featured";

/**
 * Reihenfolge des Hero-Sliders: markierte Beitraege zuerst, danach die
 * neuesten. Beide Listen kommen aus derselben Quelle und ueberschneiden sich
 * fast immer — Duplikate waeren dieselbe Folie zweimal.
 */

type Post = { id: number; title: string };

const post = (id: number): Post => ({ id, title: `Beitrag ${id}` });

describe("mergeFeaturedFirst", () => {
  it("stellt die markierten Beitraege vor die neuesten", () => {
    const merged = mergeFeaturedFirst([post(7), post(9)], [post(1), post(2)], 4);
    expect(merged.map((p) => p.id)).toEqual([7, 9, 1, 2]);
  });

  it("zeigt einen Beitrag nur einmal, auch wenn er in beiden Listen steht", () => {
    const merged = mergeFeaturedFirst([post(3)], [post(3), post(4), post(5)], 3);
    expect(merged.map((p) => p.id)).toEqual([3, 4, 5]);
  });

  it("schneidet auf das Limit zu", () => {
    const merged = mergeFeaturedFirst([post(1), post(2)], [post(3), post(4)], 3);
    expect(merged).toHaveLength(3);
    expect(merged.map((p) => p.id)).toEqual([1, 2, 3]);
  });

  it("kommt ohne markierte Beitraege aus", () => {
    const merged = mergeFeaturedFirst([], [post(1), post(2)], 5);
    expect(merged.map((p) => p.id)).toEqual([1, 2]);
  });

  it("liefert bei Limit 0 oder leeren Quellen eine leere Liste", () => {
    expect(mergeFeaturedFirst([post(1)], [post(2)], 0)).toEqual([]);
    expect(mergeFeaturedFirst<Post>([], [], 3)).toEqual([]);
  });

  it("erhaelt die Reihenfolge innerhalb der Gruppen", () => {
    const merged = mergeFeaturedFirst([post(9), post(8)], [post(5), post(9), post(4)], 5);
    expect(merged.map((p) => p.id)).toEqual([9, 8, 5, 4]);
  });
});
