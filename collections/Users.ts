import type { CollectionConfig } from "payload";

/**
 * Redaktions-Accounts fuer den Payload-Admin. Keine oeffentliche Registrierung —
 * Nutzer werden im Admin oder per Seed-Skript angelegt.
 */
export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Benutzer", plural: "Benutzer" },
  auth: true,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "updatedAt"],
    group: "System",
    description: "Zugaenge zur Redaktion dieser Website.",
  },
  access: {
    // Nur eingeloggte Redakteure sehen und verwalten Accounts.
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Name",
      admin: {
        description: "Vor- und Nachname — erscheint in der Versionshistorie.",
      },
    },
  ],
};
