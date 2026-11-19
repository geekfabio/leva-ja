import { expect, test } from "./fixtures";
import { trackErrors } from "./helpers";

test("o mapa web carrega tiles OpenStreetMap, mostra o marcador do utilizador e a atribuição", async ({ page }) => {
  const errors = trackErrors(page);
  const tiles: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("tile.openstreetmap.org")) tiles.push(request.url());
  });
  await page.goto("/home");
  await expect(page.getByText("© OpenStreetMap contributors").first()).toBeVisible();
  await expect.poll(() => tiles.length, { timeout: 15_000 }).toBeGreaterThan(0);
  expect(tiles[0]).toMatch(/\/\d+\/\d+\/\d+\.png$/);
  await expect(page.getByRole("button", { name: "Aproximar mapa" }).first()).toBeVisible();
  errors.expectNone();
});
