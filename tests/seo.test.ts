import { describe, expect, it } from "vitest";

import { indexingAllowed } from "@/lib/seo";

describe("indexingAllowed", () => {
  it("keeps the site indexable when the checkbox is on", () => {
    expect(indexingAllowed({ isIndexable: true })).toBe(true);
  });

  it("blocks indexing only for an explicit false", () => {
    expect(indexingAllowed({ isIndexable: false })).toBe(false);
  });

  it("treats a missing value as indexable", () => {
    // Reading NULL as "not indexable" would pull a live site out of Google
    // without anyone asking — do not simplify this to `!settings.isIndexable`.
    expect(indexingAllowed({ isIndexable: null })).toBe(true);
    expect(indexingAllowed({})).toBe(true);
  });
});
