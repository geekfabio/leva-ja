import { defineConfig } from "@playwright/test";

const PORT = 8090;

/**
 * Testes ponta a ponta sobre o build web, com um servidor falso em memória (EXPO_PUBLIC_E2E=1).
 * `npm run test:e2e` gera o build e serve-o; ver e2e/.
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 150_000,
  expect: { timeout: 20_000 },
  fullyParallel: true,
  workers: 2,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 390, height: 844 },
    locale: "pt-PT",
    timezoneId: "Africa/Luanda",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npx expo export -p web --clear --output-dir dist-e2e && node e2e/serve.mjs dist-e2e ${PORT}`,
    env: { EXPO_PUBLIC_E2E: "1", EXPO_PUBLIC_API_URL: "http://api.e2e.test" },
    url: `http://localhost:${PORT}`,
    timeout: 400_000,
    reuseExistingServer: !process.env.CI,
  },
});
