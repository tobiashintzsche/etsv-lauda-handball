/**
 * Dummy-Umgebung fuer Unit-Tests.
 *
 * `lib/env.ts` wirft beim Import, wenn DATABASE_URL oder PAYLOAD_SECRET fehlen.
 * Module, die (auch nur transitiv) davon abhaengen, waeren sonst nicht
 * importierbar. Vorhandene Werte gewinnen, damit eine echte `.env` beim
 * lokalen Lauf nicht ueberschrieben wird.
 */
const TEST_ENV_DEFAULTS: Record<string, string> = {
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5502/etsv_lauda_test",
  PAYLOAD_SECRET: "test-secret-at-least-32-characters-long",
  NEXT_PUBLIC_SERVER_URL: "http://localhost:3000",
  // Zeitzonen-abhaengige Formatierungen (lib/format.ts) sollen unabhaengig
  // von der Maschine reproduzierbar sein.
  TZ: "Europe/Berlin",
};

for (const [key, value] of Object.entries(TEST_ENV_DEFAULTS)) {
  if (!process.env[key]) process.env[key] = value;
}
