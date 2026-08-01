import type { CollectionBeforeChangeHook } from "payload";
import { describe, expect, it } from "vitest";

import { calculateReadingTime } from "@/lib/payload-hooks/calculateReadingTime";

type HookArgs = Parameters<CollectionBeforeChangeHook>[0];

/** Der Hook liest ausschliesslich `data` — der Rest der Payload-Args entfaellt. */
function run(data: Record<string, unknown>) {
  return calculateReadingTime({ data, operation: "create" } as unknown as HookArgs) as Record<
    string,
    unknown
  >;
}

/** Lexical-Fixture: `words` Woerter, verteilt auf Absaetze zu je 20 Woertern. */
function lexicalWithWords(words: number) {
  const paragraphs = [];
  for (let i = 0; i < words; i += 20) {
    const chunk = Math.min(20, words - i);
    paragraphs.push({
      type: "paragraph",
      version: 1,
      children: Array.from({ length: chunk }, (_, n) => ({
        type: "text",
        version: 1,
        text: `wort${i + n}`,
      })),
    });
  }
  return { root: { type: "root", version: 1, children: paragraphs } };
}

describe("calculateReadingTime", () => {
  it("derives 2 minutes from a ~400 word article (200 WPM)", () => {
    const data = run({ body: lexicalWithWords(400) });
    expect(data.readingTime).toBe(2);
  });

  it("scales with the word count", () => {
    expect(run({ body: lexicalWithWords(200) }).readingTime).toBe(1);
    expect(run({ body: lexicalWithWords(600) }).readingTime).toBe(3);
    expect(run({ body: lexicalWithWords(1000) }).readingTime).toBe(5);
  });

  it("rounds to the nearest minute", () => {
    expect(run({ body: lexicalWithWords(240) }).readingTime).toBe(1); // 1.2
    expect(run({ body: lexicalWithWords(300) }).readingTime).toBe(2); // 1.5 → auf
    expect(run({ body: lexicalWithWords(500) }).readingTime).toBe(3); // 2.5 → auf
  });

  it("never returns less than 1 minute", () => {
    expect(run({}).readingTime).toBe(1);
    expect(run({ body: lexicalWithWords(0) }).readingTime).toBe(1);
    expect(run({ excerpt: "Kurz." }).readingTime).toBe(1);
    expect(run({ body: { root: { children: [] } } }).readingTime).toBe(1);
  });

  it("counts the excerpt as well as the body", () => {
    const excerpt = Array.from({ length: 200 }, (_, i) => `t${i}`).join(" ");
    expect(run({ excerpt, body: lexicalWithWords(200) }).readingTime).toBe(2);
  });

  it("respects a manually set reading time and leaves the value untouched", () => {
    const data = run({
      manualReadingTime: true,
      readingTime: 12,
      body: lexicalWithWords(400),
    });
    expect(data.readingTime).toBe(12);
  });

  it("still calculates when the manual flag is off", () => {
    const data = run({
      manualReadingTime: false,
      readingTime: 12,
      body: lexicalWithWords(400),
    });
    expect(data.readingTime).toBe(2);
  });

  it("walks nested Lexical nodes (lists, quotes, formatted spans)", () => {
    const nested = {
      root: {
        children: [
          {
            type: "list",
            children: [
              { type: "listitem", children: [{ text: "eins zwei drei" }] },
              { type: "listitem", children: [{ text: "vier fuenf sechs" }] },
            ],
          },
          { type: "quote", children: [{ text: "sieben acht" }] },
        ],
      },
    };
    // 8 Woerter → 0.04 min → Minimum greift.
    expect(run({ body: nested }).readingTime).toBe(1);
  });

  it("ignores nodes without text (uploads, horizontal rules)", () => {
    const withUpload = {
      root: {
        children: [
          { type: "upload", relationTo: "media", value: { id: 1 } },
          { type: "horizontalrule" },
          ...lexicalWithWords(400).root.children,
        ],
      },
    };
    expect(run({ body: withUpload }).readingTime).toBe(2);
  });

  it("tolerates a malformed body instead of throwing", () => {
    expect(run({ body: null }).readingTime).toBe(1);
    expect(run({ body: "plain string" }).readingTime).toBe(1);
    expect(run({ body: { root: null } }).readingTime).toBe(1);
    expect(run({ body: { nothing: true } }).readingTime).toBe(1);
  });

  it("returns the same data object it was given (mutating hook)", () => {
    const data: Record<string, unknown> = { body: lexicalWithWords(400) };
    const result = calculateReadingTime({
      data,
      operation: "create",
    } as unknown as HookArgs);
    expect(result).toBe(data);
  });
});
