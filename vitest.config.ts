import { defineConfig } from "vitest/config";

/**
 * Unit-Tests laufen in Node — hier wird ausschliesslich `lib/` und `fields/`
 * getestet (reine Funktionen und Payload-Hooks), keine React-Komponenten.
 *
 * `resolve.tsconfigPaths` loest die `@/*`- und `@payload-types`-Aliase aus der
 * tsconfig auf (seit Vite 8 eingebaut, deshalb kein vite-tsconfig-paths-Plugin).
 *
 * `e2e/` bleibt bewusst aussen vor: die Playwright-Specs bringen ihren eigenen
 * Runner mit und wuerden hier nur an fehlenden Globals scheitern.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    exclude: ["**/node_modules/**", "**/.next/**", "**/e2e/**"],
    restoreMocks: true,
  },
});
