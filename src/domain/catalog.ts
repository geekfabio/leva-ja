export type VehicleId = "tow" | "pickup" | "van" | "box" | "heavy" | "support";
export const vehicles: Record<
  VehicleId,
  {
    name: string;
    description: string;
    hint: string;
    cell: number;
    demoPrice: number;
  }
> = {
  tow: {
    name: "Reboque plataforma",
    description: "Transporte da tua viatura",
    hint: "Viaturas avariadas ou imobilizadas",
    cell: 0,
    demoPrice: 17000,
  },
  pickup: {
    name: "Pickup · tipo Hilux",
    description: "Carga leve e pequenos volumes",
    hint: "Caixas, compras e pequenos móveis",
    cell: 1,
    demoPrice: 11000,
  },
  van: {
    name: "Carrinha fechada",
    description: "Carga protegida durante o transporte",
    hint: "Encomendas e mobiliário compacto",
    cell: 2,
    demoPrice: 16500,
  },
  box: {
    name: "Camião de mudanças",
    description: "Mais espaço para a tua casa",
    hint: "Móveis, electrodomésticos e caixas",
    cell: 3,
    demoPrice: 33500,
  },
  heavy: {
    name: "Camião de carga pesada",
    description: "Mercadorias de grande volume",
    hint: "Materiais, paletes e equipamento",
    cell: 4,
    demoPrice: 63500,
  },
  support: {
    name: "Viatura de apoio",
    description: "Assistência no local",
    hint: "Bateria, pneu e combustível",
    cell: 5,
    demoPrice: 8000,
  },
};
export const services = [
  {
    id: "light_cargo",
    name: "Cargas leves",
    description: "Caixas, compras e pequenos móveis.",
    vehicle: "pickup",
    vehicles: ["pickup", "van", "box"],
    transport: true,
  },
  {
    id: "moving",
    name: "Mudanças de casa",
    description: "Da tua casa actual para a próxima.",
    vehicle: "box",
    vehicles: ["box", "van", "heavy"],
    transport: true,
  },
  {
    id: "heavy_cargo",
    name: "Cargas pesadas",
    description: "Materiais, paletes e grandes volumes.",
    vehicle: "heavy",
    vehicles: ["heavy", "box"],
    transport: true,
  },
  {
    id: "tow",
    name: "Reboque de viatura",
    description: "Levar a viatura em segurança.",
    vehicle: "tow",
    vehicles: ["tow"],
    transport: false,
  },
  {
    id: "battery",
    name: "Bateria descarregada",
    description: "Ajuda para voltar a arrancar.",
    vehicle: "support",
    vehicles: ["support"],
    transport: false,
  },
  {
    id: "tire",
    name: "Pneu furado",
    description: "Troca de pneu e apoio no local.",
    vehicle: "support",
    vehicles: ["support"],
    transport: false,
  },
  {
    id: "fuel",
    name: "Falta de combustível",
    description: "Entrega no local onde estás.",
    vehicle: "support",
    vehicles: ["support"],
    transport: false,
  },
  {
    id: "other",
    name: "Outro apoio",
    description: "Conta-nos de que precisas.",
    vehicle: "support",
    vehicles: ["support"],
    transport: false,
  },
] as const;
export type ServiceId = (typeof services)[number]["id"];
export function getService(id: string) {
  return services.find((service) => service.id === id) || services[3];
}
export const money = (value: number) => value.toLocaleString("pt-PT") + " Kz";
export function demoEstimate(vehicle: VehicleId, helpers: boolean) {
  const base = vehicles[vehicle].demoPrice;
  const assistance = helpers ? 5000 : 0;
  return { base, assistance, fee: 1500, total: base + assistance + 1500 };
}
