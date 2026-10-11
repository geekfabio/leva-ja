import { useOrderStore } from "../useOrderStore";
import { useRequestDraft, requestValid } from "../useRequestDraft";
import { activeOrder, nearbyOrders } from "@/mocks/orders";
import { services, demoEstimate } from "@/domain/catalog";

beforeEach(() => {
  useRequestDraft.getState().reset();
  useOrderStore.setState({
    orders: nearbyOrders.map((order) => ({ ...order })),
    selectedOrder: { ...activeOrder },
    online: true,
  });
});
function movingDraft() {
  useRequestDraft.getState().reset("moving");
  useRequestDraft
    .getState()
    .update({
      cargoDescription: "Sofá e 12 caixas",
      weightKg: "250",
      dimensions: "2 m × 1 m × 1 m",
      destination: "Talatona, Rua 12",
      helpers: true,
      pickupAccess: "3.º andar sem elevador",
    });
  return useRequestDraft.getState();
}

test("cargo cannot be confirmed without its description, positive weight, dimensions and delivery address", () => {
  useRequestDraft.getState().reset("heavy_cargo");
  expect(requestValid(useRequestDraft.getState())).toBe(false);
  const valid = movingDraft();
  expect(requestValid(valid)).toBe(true);
  for (const values of [
    { weightKg: "-1" },
    { weightKg: "abc" },
    { destination: "" },
    { dimensions: "" },
    { cargoDescription: "" },
  ]) {
    expect(requestValid({ ...valid, ...values })).toBe(false);
    expect(
      useOrderStore
        .getState()
        .createRequest({ ...valid, ...values }, "Numerário"),
    ).toBeNull();
  }
});

test("changing service replaces an incompatible vehicle and removes cargo helpers for assistance", () => {
  movingDraft();
  useRequestDraft.getState().chooseService("battery");
  const draft = useRequestDraft.getState();
  expect(draft.vehicleType).toBe("support");
  expect(draft.helpers).toBe(false);
  expect(requestValid({ ...draft, vehicleType: "heavy" })).toBe(false);
});

test.each(services.map((service) => [service.id] as const))(
  "%s creates an independent order with the selected vehicle and payment",
  (id) => {
    const cargo = movingDraft();
    cargo.chooseService(id);
    const draft = useRequestDraft.getState();
    const orderId = useOrderStore.getState().createRequest(draft, "Numerário");
    const order = useOrderStore
      .getState()
      .orders.find((item) => item.id === orderId)!;
    expect(order.serviceId).toBe(id);
    expect(order.vehicleType).toBe(draft.vehicleType);
    expect(order.destination).toBe(
      services.find((service) => service.id === id)?.transport || id === "tow"
        ? draft.destination
        : undefined,
    );
    expect(order.amount).toBe(
      demoEstimate(draft.vehicleType, draft.helpers).total,
    );
    expect(order.paymentMethod).toBe("Numerário");
    expect(order.paymentStatus).toBe("pending");
    draft.reset();
    expect(order.destination).toBe(
      services.find((service) => service.id === id)?.transport || id === "tow"
        ? "Talatona, Rua 12"
        : undefined,
    );
  },
);

test("a moving request remains consistent through acceptance, arrival and delivery", () => {
  const id = useOrderStore
    .getState()
    .createRequest(movingDraft(), "Referência Multicaixa")!;
  for (const status of [
    "accepted",
    "on_the_way",
    "arrived",
    "service_started",
    "completed",
  ] as const) {
    useOrderStore.getState().updateStatus(id, status);
    const state = useOrderStore.getState();
    expect(state.orders.find((order) => order.id === id)?.status).toBe(status);
    expect(state.selectedOrder.status).toBe(status);
    expect(state.selectedOrder.cargoDescription).toBe("Sofá e 12 caixas");
    expect(state.selectedOrder.pickupAccess).toBe("3.º andar sem elevador");
  }
  expect(useOrderStore.getState().selectedOrder.paymentStatus).toBe("pending");
  useOrderStore.getState().cancelOrder(id);
  expect(useOrderStore.getState().selectedOrder.status).toBe("completed");
});

test("offline partners cannot accept and cancelled orders cannot restart", () => {
  const id = useOrderStore
    .getState()
    .createRequest(movingDraft(), "Numerário")!;
  useOrderStore.getState().setOnline(false);
  useOrderStore.getState().updateStatus(id, "accepted");
  expect(useOrderStore.getState().selectedOrder.status).toBe("matching");
  useOrderStore.getState().setOnline(true);
  useOrderStore.getState().cancelOrder(id);
  useOrderStore.getState().updateStatus(id, "accepted");
  expect(useOrderStore.getState().selectedOrder.status).toBe("cancelled");
});
