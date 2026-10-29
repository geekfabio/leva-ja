import { expect, test } from "@playwright/test";
import { press, tap, trackErrors } from "./helpers";

test("prestador: aceita um pedido próximo, conclui o serviço e recebe o ganho", async ({ page }) => {
  test.slow();
  const errors = trackErrors(page);
  // Os dados vivem na API simulada em memória: a partir daqui só se navega dentro da app (sem recarregar).
  await page.goto("/partner/request/req-near-1");
  await expect(page.getByText(/Ganho 11 500 Kz|11 500 Kz/).first()).toBeVisible();
  await press(page, "Aceitar pedido");
  await page.waitForURL(/\/partner\/active\/req-near-1/);

  await press(page, "Iniciar deslocação");
  await press(page, "Cheguei ao local");
  await press(page, "Registar fotos da carga");
  await expect(page.getByText("Fotos registadas").first()).toBeVisible();
  await press(page, "Simular confirmação do cliente");
  await press(page, "Iniciar transporte");
  await press(page, "Confirmar entrega");

  await page.waitForURL(/\/partner\/proof\/req-near-1/);
  // O cliente assina com o dedo: um traço na área de assinatura.
  const pad = page.getByLabel(/Área de assinatura/).first();
  const box = (await pad.boundingBox())!;
  await page.mouse.move(box.x + 30, box.y + box.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(box.x + 30 + i * 20, box.y + box.height / 2 + (i % 2 ? 15 : -15));
  await page.mouse.up();
  await expect(page.getByLabel("Assinatura recolhida")).toBeVisible();
  await press(page, "Concluir serviço");

  await page.waitForURL(/\/partner$/);
  await expect(page.getByText("Serviço concluído").first()).toBeVisible();
  // O ganho chega à carteira pelo tempo real: 22 500 Kz de hoje + 11 500 Kz deste serviço.
  await tap(page, "Ganhos");
  await expect(page.getByLabel("Hoje: 34 000 Kz").filter({ visible: true }).first()).toBeVisible();
  errors.expectNone();
});
