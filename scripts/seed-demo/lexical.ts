/**
 * Tiny DSL for the Lexical documents the seed writes into `news.body` and the
 * `content` block. Payload stores the editor state verbatim, so the node shapes
 * below have to match what the editor itself would produce.
 */

export type LexNode = {
  type: string;
  version: number;
  [key: string]: unknown;
};

export type LexicalDoc = {
  root: {
    type: string;
    children: LexNode[];
    direction: "ltr" | null;
    format: "";
    indent: number;
    version: number;
  };
};

/** Text format bitmask — 1 = bold, 2 = italic. */
export const BOLD = 1;
export const ITALIC = 2;

export const text = (value: string, format = 0): LexNode => ({
  type: "text",
  version: 1,
  format,
  mode: "normal",
  text: value,
  detail: 0,
  style: "",
});

export const para = (...children: LexNode[]): LexNode => ({
  type: "paragraph",
  version: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  textFormat: 0,
  children,
});

/** Shorthand for a paragraph that holds a single unformatted string. */
export const p = (value: string): LexNode => para(text(value));

export const heading = (tag: "h2" | "h3", value: string): LexNode => ({
  type: "heading",
  tag,
  version: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  children: [text(value)],
});

export const quote = (value: string): LexNode => ({
  type: "quote",
  version: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  children: [para(text(value))],
});

/** Inline image. `mediaId` must point at an existing `media` document. */
export const image = (mediaId: number, caption?: string): LexNode => ({
  type: "upload",
  version: 3,
  format: "",
  relationTo: "media",
  value: mediaId,
  fields: caption ? { caption } : {},
});

export const list = (kind: "bullet" | "number", items: string[]): LexNode => ({
  type: "list",
  listType: kind,
  start: 1,
  tag: kind === "bullet" ? "ul" : "ol",
  version: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  children: items.map((item, index) => ({
    type: "listitem",
    value: index + 1,
    version: 1,
    direction: "ltr",
    format: "",
    indent: 0,
    children: [text(item)],
  })),
});

/** Wraps the nodes in the root every Lexical field expects. */
export function body(...nodes: LexNode[]): LexicalDoc {
  return {
    root: {
      type: "root",
      children: nodes,
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    },
  };
}
