import { expect, type Page } from "@playwright/test";

/** Junta os erros da página (excepções e console.error) para verificar no fim do teste. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return {
    errors,
    expectNone: () => expect(errors, errors.join("\n")).toEqual([]),
  };
}

/** Clica no primeiro elemento visível com este texto exacto (botões e cartões do kit). */
export const tap = (page: Page, text: string) => page.getByText(text, { exact: true }).filter({ visible: true }).first().click();

/** Carrega num botão pelo nome acessível (evita textos iguais noutros sítios do ecrã). */
export const press = (page: Page, name: string) => page.getByRole("button", { name, exact: true }).filter({ visible: true }).first().click();
