import { canTransition, clientScreenFor, isActiveStatus, isCancellable, nextStatus, statusFlow } from "@/features/service/stateMachine";

describe("máquina de estados do serviço", () => {
  it("segue o fluxo feliz sem saltar etapas", () => {
    for (let i = 0; i < statusFlow.length - 1; i++) {
      expect(nextStatus(statusFlow[i]!)).toBe(statusFlow[i + 1]);
      expect(canTransition(statusFlow[i]!, statusFlow[i + 1]!)).toBe(true);
    }
    expect(canTransition("searching", "arrived")).toBe(false);
    expect(canTransition("in_transit", "paid")).toBe(false);
    expect(nextStatus("rated")).toBeUndefined();
  });

  it("só permite cancelar antes da recolha", () => {
    expect(isCancellable("searching")).toBe(true);
    expect(isCancellable("arrived")).toBe(true);
    expect(canTransition("pickup_confirmed", "cancelled")).toBe(false);
    expect(canTransition("in_transit", "cancelled")).toBe(false);
  });

  it("classifica pedidos activos e associa um ecrã a cada estado", () => {
    expect(isActiveStatus("en_route")).toBe(true);
    expect(isActiveStatus("rated")).toBe(false);
    expect(isActiveStatus("cancelled")).toBe(false);
    for (const status of [...statusFlow, "cancelled" as const]) expect(clientScreenFor[status]).toMatch(/^\//);
  });
});
