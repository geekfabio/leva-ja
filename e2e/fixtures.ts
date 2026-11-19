import { expect, test as base } from "@playwright/test";

/** PNG transparente de 1×1: os testes não saem para a rede dos mapas. */
const TILE = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");

/** `page` com os tiles OpenStreetMap e o OSRM respondidos localmente (rota em linha recta). */
export const test = base.extend({
  page: async ({ page }, provide) => {
    await page.route("**/tile.openstreetmap.org/**", (route) => route.fulfill({ status: 200, contentType: "image/png", body: TILE }));
    await page.route("**/router.project-osrm.org/route/v1/driving/**", (route) => {
      const coords = decodeURIComponent(new URL(route.request().url()).pathname.split("/").pop() ?? "").split(";").map((pair) => pair.split(",").map(Number));
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ code: "Ok", routes: [{ distance: 5200, duration: 780, geometry: { type: "LineString", coordinates: coords } }] }),
      });
    });
    await provide(page);
  },
});

export { expect };
