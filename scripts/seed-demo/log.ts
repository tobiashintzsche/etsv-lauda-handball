/** Minimal ANSI logger shared by every demo-seed module. */
export const log = {
  step: (m: string) => console.log(`\n\x1b[1;36m▶ ${m}\x1b[0m`),
  ok: (m: string) => console.log(`  \x1b[32m✓\x1b[0m ${m}`),
  skip: (m: string) => console.log(`  \x1b[2m·\x1b[0m ${m}`),
  warn: (m: string) => console.log(`  \x1b[33m⚠\x1b[0m ${m}`),
  err: (m: string) => console.log(`  \x1b[31m✗\x1b[0m ${m}`),
  info: (m: string) => console.log(`    \x1b[2m${m}\x1b[0m`),
};
