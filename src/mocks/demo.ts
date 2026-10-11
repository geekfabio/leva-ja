import { activeOrder, freightOrders } from "./orders";
import type { Order } from "@/types/order";

export type DemoScenario = {
  id: string;
  title: string;
  description: string;
  orderId: string;
  orders: Order[];
};

const base: Order = activeOrder;
const history: Order[] = [
  {
    ...base,
    id: "LJ-2590",
    serviceId: "battery",
    vehicleType: "support",
    destination: undefined,
    merchant: "Bateria descarregada",
    category: "Assistência no local",
    amount: 9500,
    etaMinutes: 28,
    status: "completed",
    address: "Mutamba, Luanda",
    vehicle: "Hyundai i10 · 2020",
    provider: "AutoHelp Luanda",
    plate: "LD-81-06-BB",
  },
  {
    ...base,
    id: "LJ-2548",
    serviceId: "tire",
    vehicleType: "support",
    destination: undefined,
    merchant: "Pneu furado",
    category: "Assistência no local",
    amount: 7000,
    etaMinutes: 22,
    status: "completed",
    address: "Maianga, Luanda",
    vehicle: "Kia Sportage · 2018",
  },
  {
    ...base,
    id: "LJ-2604",
    serviceId: "fuel",
    vehicleType: "support",
    destination: undefined,
    merchant: "Entrega de combustível",
    category: "Assistência no local",
    amount: 8500,
    etaMinutes: 14,
    status: "matching",
    address: "Talatona, Rua do MAT",
    vehicle: "Kia Sportage · 2018",
    provider: undefined,
    paymentStatus: "pending",
  },
  {
    ...base,
    id: "LJ-2603",
    merchant: "Reboque de viatura",
    amount: 24000,
    etaMinutes: 0,
    status: "arrived",
    address: "Kilamba, Condomínio Cruzeiro",
    vehicle: "Toyota Hilux · 2021",
    provider: "Carlos Mendes",
    plate: "LD-77-KM",
  },
];
export const demoScenarios: DemoScenario[] = [
  ...freightOrders.map((order) => ({
    id: order.serviceId!,
    title: order.merchant,
    description: `${order.cargoDescription}. Da aceitação à entrega, explora o pedido nos dois perfis.`,
    orderId: order.id,
    orders: [order, ...history.filter((item) => item.status === "completed")],
  })),
  {
    id: "tracking",
    title: "Cliente · reboque a caminho",
    description:
      "João Manuel desloca-se ao cliente; ideal para tracking, chat e chamada.",
    orderId: base.id,
    orders: [base, ...history],
  },
  {
    id: "provider",
    title: "Prestador · pedido por aceitar",
    description:
      "Pedido novo disponível para aceitar e avançar por todos os estados.",
    orderId: "LJ-2604",
    orders: [
      { ...history[2] },
      base,
      ...history.filter((item) => item.id !== "LJ-2604"),
    ],
  },
  {
    id: "arrival",
    title: "Prestador · chegou ao local",
    description: "Viatura já localizada; permite recolha, provas e conclusão.",
    orderId: "LJ-2603",
    orders: [
      { ...history[3] },
      base,
      ...history.filter((item) => item.id !== "LJ-2603"),
    ],
  },
  {
    id: "payment-failed",
    title: "Cliente · pagamento falhou",
    description: "Fluxo de recuperação de pagamento e suporte.",
    orderId: "LJ-2601",
    orders: [
      { ...base, paymentStatus: "failed", status: "accepted" },
      ...history,
    ],
  },
  {
    id: "dispute",
    title: "Operações · pedido em disputa",
    description: "Cenário para reclamação, SOS e intervenção administrativa.",
    orderId: "LJ-2601",
    orders: [
      { ...base, status: "disputed", paymentStatus: "refunded" },
      ...history,
    ],
  },
];
export const presentationSeed = {
  customer: {
    name: "Armando Trindade",
    phone: "+244 912 345 678",
    vehicles: ["Toyota Corolla · 2015", "Kia Sportage · 2018"],
  },
  provider: {
    name: "João Manuel",
    phone: "+244 923 456 789",
    rating: "4,9",
    documents: ["Carta de condução", "Seguro da viatura", "Registo do reboque"],
  },
  workshops: [
    "Oficina Auto Centro · Maianga",
    "Auto Rápido Luanda · Mutamba",
    "Garage Kilamba · Kilamba",
  ],
  zones: ["Ingombota", "Maianga", "Mutamba", "Talatona", "Kilamba"],
};
