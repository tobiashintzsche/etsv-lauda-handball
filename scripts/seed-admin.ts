/**
 * Creates the first admin user so `/admin` is reachable after a fresh install.
 *
 * Usage:
 *   pnpm seed:admin
 *   ADMIN_EMAIL=x@y.de ADMIN_PASSWORD=... pnpm seed:admin
 *
 * Idempotent: an existing account with the same email is left untouched.
 */
const EMAIL = process.env.ADMIN_EMAIL ?? "admin@etsv-lauda.de";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "handball2026";
const NAME = process.env.ADMIN_NAME ?? "Administrator";

const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;

async function main() {
  // Dynamic import: Payload reads process.env at module load, so it must not be
  // hoisted above the env setup that `node --env-file` performs.
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");

  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: EMAIL } },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    console.log(yellow(`→ Benutzer ${EMAIL} existiert bereits — nichts zu tun.`));
    process.exit(0);
  }

  await payload.create({
    collection: "users",
    data: { email: EMAIL, password: PASSWORD, name: NAME },
  });

  console.log(green(`✓ Admin angelegt: ${EMAIL}`));
  console.log(yellow("  Passwort nach dem ersten Login aendern!"));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
