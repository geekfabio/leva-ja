import { expect, test } from "@playwright/test";
import { tap, trackErrors } from "./helpers";

test.describe("entrada na app", () => {
  test("cliente: onboarding, login e localização até ao início", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    await page.waitForURL(/\/intro/);
    await tap(page, "Saltar");
    await page.waitForURL(/\/profile-select/);
    await tap(page, "Preciso de um serviço");
    await tap(page, "Continuar");
    await page.waitForURL(/\/login/);
    await page.getByPlaceholder("Email").fill("armando@email.com");
    await page.getByPlaceholder("Palavra-passe").fill("segredo12");
    await tap(page, "Entrar");
    await page.waitForURL(/\/enable-location/);
    await tap(page, "Permitir localização");
    await page.waitForURL(/\/home/);
    await expect(page.getByText("Olá, Armando")).toBeVisible();
    errors.expectNone();
  });

  test("prestador: login até ao painel", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/profile-select");
    await tap(page, "Sou prestador");
    await tap(page, "Continuar");
    await page.getByPlaceholder("Email").fill("joao.manuel@angoleva.ao");
    await page.getByPlaceholder("Palavra-passe").fill("segredo12");
    await tap(page, "Entrar");
    await page.waitForURL(/\/enable-location/);
    await tap(page, "Agora não");
    await page.waitForURL(/\/partner/);
    await expect(page.getByText("Olá, João")).toBeVisible();
    errors.expectNone();
  });

  test("palavra-passe curta é recusada com mensagem", async ({ page }) => {
    await page.goto("/profile-select");
    await tap(page, "Preciso de um serviço");
    await tap(page, "Continuar");
    await page.getByPlaceholder("Email").fill("armando@email.com");
    await page.getByPlaceholder("Palavra-passe").fill("123");
    await tap(page, "Entrar");
    await expect(page).toHaveURL(/\/login/);
  });
});
