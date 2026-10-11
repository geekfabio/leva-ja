import { demoEstimate, getService, vehicles } from "@/domain/catalog";
import type { ServiceId, VehicleId } from "@/domain/catalog";
import type { Order } from "@/types/order";

export const activeOrder: Order = {
  id: "LJ-2601",
  serviceId: "tow",
  vehicleType: "tow",
  merchant: "Reboque urgente",
  category: "Reboque de viatura",
  amount: 18500,
  etaMinutes: 18,
  status: "on_the_way",
  address: "Rua da Missão, Ingombota",
  vehicle: "Toyota Corolla · 2015",
  provider: "João Manuel",
  plate: "LD-42-18-AF",
  destination: "Oficina Auto Centro, Maianga",
  paymentMethod: "Referência Multicaixa",
  paymentStatus: "confirmed",
  incidentNote: "Motor desligou durante a condução.",
  severity: "medium",
  image:
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
};

function freightOrder(
  id: string,
  serviceId: ServiceId,
  vehicleType: VehicleId,
  cargoDescription: string,
  weightKg: string,
  dimensions: string,
  helpers = false,
): Order {
  const price = demoEstimate(vehicleType, helpers);
  return {
    id,
    serviceId,
    vehicleType,
    merchant: getService(serviceId).name,
    category: getService(serviceId).name,
    vehicle: vehicles[vehicleType].name,
    cargoDescription,
    weightKg,
    dimensions,
    helpers,
    address: "Rua da Missão, Ingombota",
    destination: "Rua 12, Talatona",
    pickupAccess: helpers
      ? "3.º andar, sem elevador"
      : "Recolha ao nível da rua",
    deliveryAccess: "Portão com acesso para descarga",
    amount: price.total,
    pricing: { base: price.base, assistance: price.assistance, fee: price.fee },
    status: "matching",
    etaMinutes: 20,
    paymentMethod: "Numerário",
    paymentStatus: "pending",
    image: "",
    evidence: [],
    proof: [],
    messages: [],
  };
}

export const freightOrders: Order[] = [
  freightOrder(
    "LJ-2701",
    "light_cargo",
    "pickup",
    "6 caixas de mercadoria e uma secretária",
    "150",
    "2 m × 1 m × 1 m",
  ),
  freightOrder(
    "LJ-2702",
    "moving",
    "box",
    "Sofá, frigorífico, cama desmontada e 12 caixas",
    "750",
    "4 m × 2 m × 2 m",
    true,
  ),
  freightOrder(
    "LJ-2703",
    "heavy_cargo",
    "heavy",
    "Paletes de materiais de construção",
    "3500",
    "5 m × 2 m × 2 m",
  ),
];

export const nearbyOrders: Order[] = [
  activeOrder,
  ...freightOrders,
  {
    id: "LJ-2590",
    serviceId: "battery",
    vehicleType: "support",
    merchant: "Bateria descarregada",
    category: "Assistência no local",
    amount: 9500,
    etaMinutes: 28,
    status: "completed",
    address: "Mutamba, Luanda",
    vehicle: "Hyundai i10 · 2020",
    provider: "AutoHelp Luanda",
    plate: "LD-81-06-BB",
    image:
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "LJ-2548",
    serviceId: "tire",
    vehicleType: "support",
    merchant: "Pneu furado",
    category: "Assistência no local",
    amount: 7000,
    etaMinutes: 22,
    status: "completed",
    address: "Maianga, Luanda",
    vehicle: "Kia Sportage · 2018",
    provider: "João Manuel",
    plate: "LD-10-96-CC",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
  },
];
