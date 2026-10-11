import { demoScenarios } from "@/mocks/demo";
import { useOrderStore } from "@/stores/useOrderStore";
import { vehicles, demoEstimate } from "@/domain/catalog";

it.each(["light_cargo", "moving", "heavy_cargo"])(
  "loads a repeatable %s journey for both profiles",
  (id) => {
    const scenario = demoScenarios.find((item) => item.id === id)!;
    useOrderStore.getState().setOnline(false);
    useOrderStore.getState().loadScenario(scenario);
    const initial = useOrderStore.getState().selectedOrder;
    expect(initial.vehicle).toBe(vehicles[initial.vehicleType!].name);
    expect(initial.amount).toBe(
      demoEstimate(initial.vehicleType!, !!initial.helpers).total,
    );
    expect(initial.destination).toBeTruthy();
    expect(useOrderStore.getState().online).toBe(true);
    useOrderStore.getState().updateStatus(initial.id, "accepted");
    expect(useOrderStore.getState().selectedOrder.status).toBe("accepted");
    useOrderStore
      .getState()
      .selectedOrder.messages!.push("Mensagem de exemplo");
    useOrderStore.getState().loadScenario(scenario);
    expect(useOrderStore.getState().selectedOrder.status).toBe("matching");
    expect(useOrderStore.getState().selectedOrder.messages).toEqual([]);
    expect(useOrderStore.getState().orders).toHaveLength(
      scenario.orders.length,
    );
  },
);
