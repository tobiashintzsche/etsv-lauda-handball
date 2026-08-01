import type { Field, GroupField } from "payload";

import deepMerge from "@/lib/deepMerge";

export type LinkAppearance = "primary" | "arrow" | "inline";

export const appearanceOptions: Record<LinkAppearance, { label: string; value: string }> = {
  primary: { label: "Button (gelb)", value: "primary" },
  arrow: { label: "Link mit Pfeil", value: "arrow" },
  inline: { label: "Text-Link", value: "inline" },
};

/** Collections a link reference may point to — all have routable detail pages. */
export type LinkRelationTo = "pages" | "news" | "teams";

type LinkFieldOptions = {
  /** Which appearance options to offer. `false` omits the field entirely. */
  appearances?: LinkAppearance[] | false;
  /** Omit the visible link text (e.g. when the surrounding block supplies it). */
  disableLabel?: boolean;
  /**
   * When false, adds a "Kein Link" option so the target is optional. Use for
   * nav items that only open a flyout.
   */
  required?: boolean;
  relationTo?: LinkRelationTo[];
  /** Pre-selected appearance. Must be part of `appearances`. */
  defaultAppearance?: LinkAppearance;
  overrides?: Partial<GroupField>;
};

/**
 * Shared link field factory.
 *
 * Produces a group with a `type` radio (internal reference / custom URL /
 * optionally none), the matching target field, an optional label and an
 * optional appearance select. Reuse under a different name via
 * `overrides: { name: "cta" }`.
 *
 * `reference` and `url` use `validate` instead of `required` on purpose:
 * a `required` field that is hidden by a `condition` still blocks saving.
 */
export const link = ({
  appearances,
  disableLabel = false,
  required = true,
  relationTo = ["pages", "news", "teams"],
  defaultAppearance,
  overrides = {},
}: LinkFieldOptions = {}): Field => {
  const typeOptions = [
    { label: "Interne Seite", value: "reference" },
    { label: "Eigene URL", value: "custom" },
  ];

  if (!required) {
    typeOptions.unshift({ label: "Kein Link", value: "none" });
  }

  const linkResult: GroupField = {
    name: "link",
    type: "group",
    label: "Link",
    admin: { hideGutter: true },
    fields: [
      {
        type: "row",
        fields: [
          {
            name: "type",
            type: "radio",
            label: "Link-Typ",
            defaultValue: required ? "reference" : "none",
            options: typeOptions,
            admin: {
              layout: "horizontal",
              width: "50%",
              description: "Auf eine Seite dieser Website oder auf eine fremde Adresse verlinken.",
            },
          },
          {
            name: "newTab",
            type: "checkbox",
            label: "In neuem Tab oeffnen",
            admin: {
              style: { alignSelf: "flex-end" },
              width: "50%",
              condition: (_, siblingData) => siblingData?.type !== "none",
              description: "Fuer externe Ziele empfohlen (z.B. handball.net, Instagram).",
            },
          },
        ],
      },
    ],
  };

  const linkTypes: Field[] = [
    {
      name: "reference",
      type: "relationship",
      label: "Verknuepfte Seite",
      relationTo,
      admin: {
        condition: (_, siblingData) => siblingData?.type === "reference",
        description: "Seite, News-Beitrag oder Mannschaft auswaehlen.",
      },
      validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) => {
        if (siblingData?.type === "reference" && !value) {
          return "Bitte eine Seite auswaehlen.";
        }
        return true;
      },
    },
    {
      name: "url",
      type: "text",
      label: "URL",
      admin: {
        condition: (_, siblingData) => siblingData?.type === "custom",
        description: "Vollstaendige Adresse inkl. https:// — oder ein interner Pfad wie /news.",
      },
      validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) => {
        if (siblingData?.type === "custom" && !value) {
          return "Bitte eine URL eingeben.";
        }
        return true;
      },
    },
  ];

  if (disableLabel) {
    linkResult.fields = [...linkResult.fields, ...linkTypes];
  } else {
    linkResult.fields.push({
      type: "row",
      fields: [
        ...linkTypes,
        {
          name: "label",
          type: "text",
          label: "Link-Text",
          required,
          admin: {
            width: "50%",
            description: "Der sichtbare Text des Links.",
            ...(!required && {
              condition: (_: unknown, siblingData: Record<string, unknown>) =>
                siblingData?.type !== "none",
            }),
          },
          ...(!required && {
            validate: (
              value: unknown,
              { siblingData }: { siblingData: Record<string, unknown> },
            ) => {
              if (siblingData?.type !== "none" && !value) {
                return "Bitte einen Link-Text eingeben.";
              }
              return true;
            },
          }),
        },
      ],
    });
  }

  if (appearances !== false) {
    const optionsToUse = appearances
      ? appearances.map((a) => appearanceOptions[a])
      : [appearanceOptions.primary, appearanceOptions.arrow, appearanceOptions.inline];

    // The default MUST be part of the options — Postgres stores this as an
    // enum and rejects a value that is not in the type.
    const fallback = optionsToUse[0]?.value ?? "arrow";
    const resolvedDefault =
      defaultAppearance && optionsToUse.some((o) => o.value === defaultAppearance)
        ? defaultAppearance
        : fallback;

    linkResult.fields.push({
      name: "appearance",
      type: "select",
      label: "Link-Stil",
      defaultValue: resolvedDefault,
      options: optionsToUse,
      admin: {
        description: "Darstellung des Links — gelber Button, Pfeil-Link oder schlichter Text.",
      },
    });
  }

  return deepMerge(linkResult, overrides as Record<string, unknown>) as Field;
};
