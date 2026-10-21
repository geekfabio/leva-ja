import type { ServiceRequest } from "@/types/domain";
import { buildRequest } from "@/features/booking/factory";
import { daysAgo } from "@/utils/date";
import { places } from "./places";
import { cargoPhotos, deliveryPhotos } from "./photos";

const proofFor = (signedBy: string, at: string) => ({
  photos: deliveryPhotos,
  signedBy,
  goodCondition: true,
  at,
});

/** Histórico do cliente autenticado (Armando Manuel), servido por João Manuel. */
const clientHistory: ServiceRequest[] = [
  buildRequest({
    id: "req-hist-1",
    kind: "tow",
    origin: places.maianga,
    destination: places.talatona,
    clientId: "cli-armando",
    providerId: "prv-paulo",
    status: "rated",
    createdAt: daysAgo(9, "14:32"),
    tow: { incident: "mechanical", brand: "Hyundai", model: "Tucson", plate: "LD-22-41-AC", color: "Prata", canMove: false },
    paymentMethod: "card",
    rating: 5,
    review: "Rápido e cuidadoso com a viatura.",
  }),
  buildRequest({
    id: "req-hist-2",
    kind: "cargo",
    origin: places.samba,
    destination: places.camama,
    clientId: "cli-armando",
    providerId: "prv-joao",
    status: "rated",
    createdAt: daysAgo(18, "10:15"),
    cargo: { cargoType: "appliances", description: "Frigorífico e máquina de lavar", weight: "101to300", volume: "medium", vehicleClass: "pickup", helper: true },
    pickupPhotos: cargoPhotos.slice(0, 3),
    paymentMethod: "bank_reference",
    rating: 5,
    review: "Muito profissional.",
  }),
  buildRequest({
    id: "req-hist-3",
    kind: "small_move",
    origin: places.kilamba,
    destination: places.benfica,
    clientId: "cli-armando",
    providerId: "prv-teresa",
    status: "rated",
    createdAt: daysAgo(24, "09:20"),
    moving: { propertyType: "t2", rooms: 2, items: "Sofá, cama e caixas", helpers: 1, pickupFloor: 3, deliveryFloor: 1, elevator: true, disassembly: false, when: "now" },
    paymentMethod: "cash",
    rating: 4,
  }),
  buildRequest({
    id: "req-hist-4",
    kind: "cargo",
    origin: places.rangel,
    destination: places.viana,
    clientId: "cli-armando",
    status: "cancelled",
    createdAt: daysAgo(30, "16:05"),
    cargo: { cargoType: "construction", description: "Sacos de cimento", weight: "over500", volume: "large", vehicleClass: "truck", helper: false },
  }),
];
clientHistory[1]!.proof = proofFor("Armando Manuel", daysAgo(18, "11:10"));
clientHistory[3]!.cancelReason = "Já não preciso do serviço";

/** Pedidos novos à volta do prestador (João Manuel) que aparecem no painel e na caixa de pedidos. */
const nearbyRequests: ServiceRequest[] = [
  buildRequest({
    id: "req-near-1",
    kind: "tow",
    origin: places.valodia,
    destination: places.talatona,
    clientId: "cli-ana",
    createdAt: daysAgo(0, "14:20"),
    tow: { incident: "mechanical", brand: "Toyota", model: "Corolla", plate: "LD-10-22-BA", color: "Branco", canMove: false },
    instructions: "A viatura está junto à bomba de combustível.",
  }),
  buildRequest({
    id: "req-near-2",
    kind: "cargo",
    origin: places.missao,
    destination: places.viana,
    clientId: "cli-carlos",
    createdAt: daysAgo(0, "14:24"),
    cargo: { cargoType: "furniture", description: "Sofá, caixas e electrodomésticos", weight: "301to500", volume: "large", vehicleClass: "pickup", helper: true },
    photos: cargoPhotos.slice(0, 3),
  }),
  buildRequest({
    id: "req-near-3",
    kind: "small_move",
    origin: places.samba,
    destination: places.kilamba,
    clientId: "cli-manuel",
    createdAt: daysAgo(0, "14:26"),
    moving: { rooms: 1, items: "Cama, roupeiro e 10 caixas", helpers: 1, pickupFloor: 2, deliveryFloor: 0, elevator: false, disassembly: false, when: "now" },
    photos: cargoPhotos.slice(2, 4),
  }),
  buildRequest({
    id: "req-near-4",
    kind: "house_move",
    origin: places.talatona,
    destination: places.benfica,
    clientId: "cli-carlos",
    createdAt: daysAgo(0, "14:28"),
    moving: { propertyType: "t3", rooms: 3, items: "Mobília de sala, 3 quartos e cozinha", helpers: 2, pickupFloor: 3, deliveryFloor: 0, elevator: false, disassembly: true, when: "scheduled", date: daysAgo(-2, "10:00"), time: "10:00" },
    scheduledFor: daysAgo(-2, "10:00"),
    photos: cargoPhotos,
    instructions: "Inclui 2 ajudantes e 3.º andar sem elevador.",
  }),
];

/** Serviços já realizados pelo prestador autenticado. */
const providerHistory: ServiceRequest[] = [
  buildRequest({
    id: "req-prv-1",
    kind: "cargo",
    origin: places.ingombota,
    destination: places.talatona,
    clientId: "cli-carlos",
    providerId: "prv-joao",
    status: "rated",
    createdAt: daysAgo(0, "12:41"),
    cargo: { cargoType: "boxes", description: "Caixas de escritório", weight: "101to300", volume: "medium", vehicleClass: "pickup", helper: false },
    paymentMethod: "card",
    rating: 5,
    review: "Pontual e simpático.",
  }),
  buildRequest({
    id: "req-prv-2",
    kind: "tow",
    origin: places.ingombota,
    destination: places.talatona,
    clientId: "cli-ana",
    providerId: "prv-joao",
    status: "rated",
    createdAt: daysAgo(0, "09:18"),
    tow: { incident: "battery", brand: "Kia", model: "Rio", plate: "LD-55-10-DD", color: "Azul", canMove: false },
    paymentMethod: "cash",
    rating: 5,
  }),
  buildRequest({
    id: "req-prv-3",
    kind: "small_move",
    origin: places.ingombota,
    destination: places.talatona,
    clientId: "cli-manuel",
    providerId: "prv-joao",
    status: "rated",
    createdAt: daysAgo(1, "16:20"),
    moving: { rooms: 1, items: "Sofá, cama e caixas", helpers: 1, pickupFloor: 1, deliveryFloor: 0, elevator: true, disassembly: false, when: "now" },
    paymentMethod: "bank_reference",
    rating: 4,
  }),
  buildRequest({
    id: "req-prv-4",
    kind: "cargo",
    origin: places.sambizanga,
    destination: places.viana,
    clientId: "cli-carlos",
    providerId: "prv-joao",
    status: "cancelled",
    createdAt: daysAgo(3, "08:05"),
    cargo: { cargoType: "goods", description: "Mercadoria para loja", weight: "101to300", volume: "medium", vehicleClass: "pickup", helper: false },
  }),
];
providerHistory.forEach((request) => {
  if (request.status === "rated") request.proof = proofFor("Cliente", request.createdAt);
});
providerHistory[3]!.cancelReason = "Cliente cancelou antes da recolha";

export const seedRequests = (): ServiceRequest[] =>
  JSON.parse(JSON.stringify([...nearbyRequests, ...clientHistory, ...providerHistory]));
