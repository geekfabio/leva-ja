import { expect, test } from "@playwright/test";
import { trackErrors } from "./helpers";
import { routes } from "./routes";

/** Mensagens que nunca devem aparecer num ecrã aberto com os dados de demonstração. */
const FAILURE_TEXT = /Resposta inesperada|Sem ligação ao servidor|A sessão expirou|Não foi possível carregar/i;

for (const route of routes) {
  test(`abre ${route} sem erros`, async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto(route);
    await page.waitForTimeout(1200);
    await expect(page.locator("body")).not.toHaveText(FAILURE_TEXT);
    errors.expectNone();
  });
}
