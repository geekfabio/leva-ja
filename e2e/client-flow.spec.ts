import { expect, test } from "@playwright/test";
import { tap, trackErrors } from "./helpers";

test("cliente: pedido de carga do início ao recibo, com pagamento por referência Multicaixa", async ({ page }) => {
  test.slow();
  const errors = trackErrors(page);
  await page.goto("/home");
  await tap(page, "Carga");
  await page.waitForURL(/\/booking\/cargo/);
  await tap(page, "Continuar");

  await page.waitForURL(/\/booking\/route/);
  await page.getByLabel("Destino").first().click();
  await tap(page, "Trabalho");
  await tap(page, "Continuar");

  await page.waitForURL(/\/booking\/photos/);
  await tap(page, "Adicionar fotos");
  await expect(page.getByLabel(/Remover foto/).first()).toBeVisible();
  await tap(page, "Continuar");

  await page.waitForURL(/\/booking\/estimate/);
  await tap(page, "Confirmar pedido");

  // A simulação faz o prestador aceitar e chegar; o tempo real e o push actualizam o ecrã.
  await page.waitForURL(/\/trip\/matching/);
  await expect(page.getByText("Prestador encontrado").first()).toBeVisible({ timeout: 30_000 });
  await page.waitForURL(/\/trip\/arrived/, { timeout: 60_000 });
  await tap(page, "Confirmar início");
  await page.waitForURL(/\/trip\/(pickup|in-transit)/);
  if (page.url().includes("/trip/pickup")) await tap(page, "Confirmar recolha");

  await page.waitForURL(/\/trip\/payment/, { timeout: 60_000 });
  await tap(page, "Referência bancária");
  await tap(page, "Continuar para pagamento");
  await expect(page.getByText("11223")).toBeVisible();
  // O "banco" confirma ao fim de alguns segundos e o ecrã segue sozinho para o recibo.
  await page.waitForURL(/\/trip\/receipt/, { timeout: 30_000 });
  await expect(page.getByText("Obrigado por escolher a AngoLeva")).toBeVisible();
  errors.expectNone();
});
