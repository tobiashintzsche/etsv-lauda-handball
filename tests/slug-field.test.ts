import type { FieldHook } from "payload";
import { describe, expect, it } from "vitest";

import { formatSlug, makeSlugField, slugField } from "@/fields/slug";

type HookArgs = Parameters<FieldHook>[0];

/**
 * Payload ruft Feld-Hooks mit einem grossen Argument-Objekt auf (req, collection,
 * siblingData …). `formatSlug` liest davon nur `data`, `operation` und `value`,
 * deshalb reicht ein Teil-Objekt — der Cast haelt den Test lesbar.
 */
function runHook(
  hook: FieldHook,
  args: { data?: Record<string, unknown>; operation?: string; value?: unknown },
) {
  return hook({
    data: args.data,
    operation: args.operation,
    value: args.value,
  } as unknown as HookArgs);
}

describe("formatSlug", () => {
  const hook = formatSlug("title");

  it("respects a manually entered slug (only normalising it)", async () => {
    expect(
      await runHook(hook, {
        value: "eigener-slug",
        data: { title: "Ganz anderer Titel" },
        operation: "create",
      }),
    ).toBe("eigener-slug");
  });

  it("normalises a manually entered slug with umlauts and spaces", async () => {
    expect(
      await runHook(hook, {
        value: "Über den Verein",
        data: { title: "Irrelevant" },
        operation: "update",
      }),
    ).toBe("ueber-den-verein");
  });

  it("generates the slug from the fallback field on create", async () => {
    expect(
      await runHook(hook, {
        value: undefined,
        data: { title: "Spaß beim Saisonstart" },
        operation: "create",
      }),
    ).toBe("spass-beim-saisonstart");
  });

  it("generates from the fallback field when the slug was emptied on update", async () => {
    expect(
      await runHook(hook, {
        value: "",
        data: { title: "Nächste Spiele" },
        operation: "update",
      }),
    ).toBe("naechste-spiele");
  });

  it("keeps an existing slug on update — no silent rename when the title changes", async () => {
    expect(
      await runHook(hook, {
        value: "alter-slug",
        data: { title: "Frisch umbenannter Titel" },
        operation: "update",
      }),
    ).toBe("alter-slug");
  });

  it("returns the value unchanged when neither slug nor fallback exist", async () => {
    expect(await runHook(hook, { value: undefined, data: {}, operation: "create" })).toBe(
      undefined,
    );
    expect(await runHook(hook, { value: "", data: {}, operation: "create" })).toBe("");
  });

  it("survives a missing data object", async () => {
    expect(await runHook(hook, { value: undefined, operation: "create" })).toBe(undefined);
  });

  it("uses the configured fallback field — teams/players/sponsors derive from name", async () => {
    const nameHook = formatSlug("name");
    expect(
      await runHook(nameHook, {
        value: undefined,
        data: { name: "Männliche A-Jugend", title: "Falsches Feld" },
        operation: "create",
      }),
    ).toBe("maennliche-a-jugend");
  });
});

describe("makeSlugField", () => {
  it("builds a required, unique, indexed sidebar text field", () => {
    const field = makeSlugField("name");
    expect(field).toMatchObject({
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    });
    expect(field).toHaveProperty("admin.position", "sidebar");
  });

  it("wires formatSlug into beforeValidate", async () => {
    const field = makeSlugField("name");
    const hooks =
      "hooks" in field ? (field.hooks as { beforeValidate?: FieldHook[] } | undefined) : undefined;
    const beforeValidate = hooks?.beforeValidate ?? [];
    expect(beforeValidate).toHaveLength(1);

    expect(
      await runHook(beforeValidate[0]!, {
        value: undefined,
        data: { name: "Weibliche B-Jugend" },
        operation: "create",
      }),
    ).toBe("weibliche-b-jugend");
  });

  it("defaults to `title` — that is what slugField uses", async () => {
    const hooks =
      "hooks" in slugField
        ? (slugField.hooks as { beforeValidate?: FieldHook[] } | undefined)
        : undefined;
    const beforeValidate = hooks?.beforeValidate ?? [];

    expect(
      await runHook(beforeValidate[0]!, {
        value: undefined,
        data: { title: "Impressum" },
        operation: "create",
      }),
    ).toBe("impressum");
  });
});
