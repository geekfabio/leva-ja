import { create } from "zustand";
import { activeOrder, nearbyOrders } from "@/mocks/orders";
import type { DemoScenario } from "@/mocks/demo";
import type { Order } from "@/types/order";
import { demoEstimate, getService, vehicles } from "@/domain/catalog";
import { DraftValues, requestValid } from "./useRequestDraft";

type OrderState = {
  orders: Order[];
  selectedOrder: Order;
  online: boolean;
  setOnline: (value: boolean) => void;
  selectOrder: (orderId: string) => void;
  updateStatus: (orderId: string, status: Order["status"]) => void;
  patchOrder: (orderId: string, values: Partial<Order>) => void;
  createRequest: (draft: DraftValues, paymentMethod: string) => string | null;
  cancelOrder: (orderId: string) => void;
  loadScenario: (scenario: DemoScenario) => void;
};
const allowedNext: Partial<Record<Order["status"], Order["status"]>> = {
  matching: "accepted",
  accepted: "on_the_way",
  on_the_way: "arrived",
  arrived: "service_started",
  service_started: "completed",
};
export const useOrderStore = create<OrderState>((set, get) => ({
  orders: nearbyOrders,
  selectedOrder: activeOrder,
  online: true,
  setOnline: (online) => set({ online }),
  selectOrder: (orderId) =>
    set((state) => ({
      selectedOrder:
        state.orders.find((item) => item.id === orderId) ?? state.selectedOrder,
    })),
  patchOrder: (orderId, values) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, ...values, id: order.id } : order,
      ),
      selectedOrder:
        state.selectedOrder.id === orderId
          ? { ...state.selectedOrder, ...values, id: orderId }
          : state.selectedOrder,
    })),
  updateStatus: (orderId, status) => {
    const order = get().orders.find((item) => item.id === orderId);
    if (!order || allowedNext[order.status] !== status) return;
    if (status === "accepted" && !get().online) return;
    get().patchOrder(orderId, {
      status,
      etaMinutes: ["arrived", "service_started", "completed"].includes(status)
        ? 0
        : order.etaMinutes,
      ...(status === "accepted"
        ? { provider: "João Manuel", plate: "LD-42-18-AF" }
        : {}),
    });
  },
  createRequest: (draft, paymentMethod) => {
    if (!requestValid(draft)) return null;
    const service = getService(draft.service);
    const price = demoEstimate(draft.vehicleType, draft.helpers);
    const id =
      "LJ-" +
      (Math.max(
        2601,
        ...get().orders.map(
          (order) => Number(order.id.replace("LJ-", "")) || 0,
        ),
      ) +
        1);
    const order: Order = {
      id,
      merchant: service.name,
      category: service.name,
      serviceId: draft.service,
      vehicleType: draft.vehicleType,
      amount: price.total,
      pricing: {
        base: price.base,
        assistance: price.assistance,
        fee: price.fee,
      },
      status: "matching",
      etaMinutes: 20,
      image: "",
      address: draft.address.trim(),
      destination:
        service.transport || draft.service === "tow"
          ? draft.destination.trim() || undefined
          : undefined,
      vehicle: service.transport
        ? vehicles[draft.vehicleType].name
        : draft.customerVehicle,
      cargoDescription: service.transport ? draft.cargoDescription : undefined,
      weightKg: service.transport ? draft.weightKg : undefined,
      dimensions: service.transport ? draft.dimensions : undefined,
      helpers: draft.helpers,
      pickupAccess: draft.pickupAccess,
      deliveryAccess: draft.deliveryAccess,
      incidentNote: draft.notes,
      severity: draft.severity,
      evidence: [...draft.evidence],
      paymentMethod,
      paymentStatus: "pending",
      proof: [],
    };
    set((state) => ({
      orders: [order, ...state.orders],
      selectedOrder: order,
    }));
    return id;
  },
  cancelOrder: (orderId) => {
    const order = get().orders.find((item) => item.id === orderId);
    if (order && !["completed", "cancelled", "disputed"].includes(order.status))
      get().patchOrder(orderId, { status: "cancelled" });
  },
  loadScenario: (scenario) => {
    // Fixtures contain JSON data; isolate nested arrays from subsequent demo edits.
    const orders: Order[] = JSON.parse(JSON.stringify(scenario.orders));
    const selectedOrder = orders.find((order) => order.id === scenario.orderId);
    if (!selectedOrder) return;
    set({ orders, selectedOrder, online: true });
  },
}));
