import type { Client, Provider, Vehicle } from "@/types/domain";
import { places } from "./places";

export const currentClient: Client = {
  id: "cli-armando",
  name: "Armando Manuel",
  email: "armando@email.com",
  phone: "+244 923 456 789",
  initials: "AM",
  rating: 4.8,
  avatar: "armando-manuel",
};

export const clients: Client[] = [
  currentClient,
  {
    id: "cli-carlos",
    name: "Carlos Mendes",
    email: "carlos.mendes@email.com",
    phone: "+244 912 333 101",
    initials: "CM",
    rating: 4.9,
  },
  {
    id: "cli-ana",
    name: "Ana Sebastião",
    email: "ana.sebastiao@email.com",
    phone: "+244 934 210 888",
    initials: "AS",
    rating: 4.7,
  },
  {
    id: "cli-manuel",
    name: "Manuel Costa",
    email: "manuel.costa@gmail.com",
    phone: "+244 921 778 004",
    initials: "MC",
    rating: 5,
  },
];

export const vehicles: Record<string, Vehicle> = {
  hilux: {
    id: "veh-hilux",
    brand: "Toyota",
    model: "Hilux",
    plate: "LD-45-67-AB",
    color: "Branca",
    vehicleClass: "pickup",
    categoryLabel: "Pickup de carga",
    capacityKg: 500,
    year: 2022,
  },
  tukTuk: {
    id: "veh-tuktuk",
    brand: "Bajaj",
    model: "Maxima Cargo",
    plate: "LD-08-32-TK",
    color: "Branco e verde",
    vehicleClass: "tuk_tuk",
    categoryLabel: "Tuk-tuk de entrega",
    capacityKg: 100,
    year: 2024,
  },
  tow: {
    id: "veh-tow",
    brand: "Isuzu",
    model: "NPR Plataforma",
    plate: "LD-12-90-CF",
    color: "Verde e branco",
    vehicleClass: "tow_truck",
    categoryLabel: "Reboque plataforma",
    capacityKg: 3500,
    year: 2021,
  },
  truck: {
    id: "veh-truck",
    brand: "Mitsubishi",
    model: "Canter Caixa",
    plate: "LD-88-21-AA",
    color: "Branco",
    vehicleClass: "truck",
    categoryLabel: "Camião de mudanças",
    capacityKg: 3000,
    year: 2020,
  },
  van: {
    id: "veh-van",
    brand: "Peugeot",
    model: "Boxer",
    plate: "LD-31-07-BD",
    color: "Branca",
    vehicleClass: "van",
    categoryLabel: "Carrinha fechada",
    capacityKg: 1200,
    year: 2023,
  },
};

/** O prestador autenticado na área do prestador. */
export const currentProvider: Provider = {
  id: "prv-joao",
  name: "João Manuel",
  initials: "JM",
  phone: "+244 923 111 222",
  rating: 4.9,
  reviewsCount: 128,
  verified: true,
  avatar: "joao-manuel",
  vehicle: vehicles.hilux,
  coords: places.maculusso.coords,
};

export const providers: Provider[] = [
  currentProvider,
  {
    id: "prv-paulo",
    name: "Paulo Domingos",
    initials: "PD",
    phone: "+244 923 555 019",
    rating: 4.8,
    reviewsCount: 96,
    verified: true,
    vehicle: vehicles.tow,
    coords: places.maianga.coords,
  },
  {
    id: "prv-mateus",
    name: "Mateus António",
    initials: "MA",
    phone: "+244 923 409 218",
    rating: 4.9,
    reviewsCount: 74,
    verified: true,
    vehicle: vehicles.tukTuk,
    coords: places.ingombota.coords,
  },
  {
    id: "prv-teresa",
    name: "Teresa Neto",
    initials: "TN",
    phone: "+244 923 777 450",
    rating: 4.7,
    reviewsCount: 61,
    verified: true,
    vehicle: vehicles.truck,
    coords: places.alvalade.coords,
  },
];

export const findProvider = (id?: string) =>
  providers.find((provider) => provider.id === id);

export const findClient = (id?: string) =>
  clients.find((client) => client.id === id) ?? currentClient;

/** Fotografias reais (recortadas das referências) para as pessoas principais. */
export const avatarFor: Record<string, "joao-manuel" | "armando-manuel"> = {
  "prv-joao": "joao-manuel",
  "cli-armando": "armando-manuel",
};
