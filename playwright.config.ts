import { defineConfig, devices } from "@playwright/test";

/**
 * E2E-Smoke ueber alle Routen. Laeuft gegen eine GESEEDETE Datenbank und einen
 * Produktions-Build (`pnpm build && pnpm start`) — der Dev-Server kompiliert
 * jede Route beim ersten Aufruf und laesst die Specs in Timeouts laufen.
 *
 * `reuseExistingServer` bedeutet: laeuft lokal schon etwas auf Port 3000,
 * benutzt Playwright das und startet nichts Eigenes.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    locale: "de-DE",
    timezoneId: "Europe/Berlin",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
      testIgnore: /mobile\.spec\.ts/,
    },
    {
      // Design-Breakpoint Mobile: 390×844 (siehe figma-design-spec §1).
      name: "mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: false },
      testMatch: /mobile\.spec\.ts/,
    },
  ],

  webServer: {
    command: "pnpm start",
    port: 3000,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
