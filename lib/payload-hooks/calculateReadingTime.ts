import type { CollectionBeforeChangeHook } from "payload";

const WORDS_PER_MINUTE = 200;

function extractText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { text?: unknown; children?: unknown[] };
  if (typeof n.text === "string") return n.text;
  if (Array.isArray(n.children)) return n.children.map(extractText).join(" ");
  return "";
}

function extractFromLexical(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const v = value as { root?: { children?: unknown[] } };
  if (!v.root?.children) return "";
  return v.root.children.map(extractText).join(" ");
}

/**
 * Derives the reading time in minutes from excerpt + body on every save.
 * A manually entered value is preserved when `manualReadingTime` is set.
 */
export const calculateReadingTime: CollectionBeforeChangeHook = ({ data }) => {
  if (data?.manualReadingTime) return data;

  const texts: string[] = [];
  if (typeof data?.excerpt === "string") texts.push(data.excerpt);
  if (data?.body) texts.push(extractFromLexical(data.body));

  const wordCount = texts.join(" ").split(/\s+/).filter(Boolean).length;
  data.readingTime = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));

  return data;
};
