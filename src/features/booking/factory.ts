import type { CargoDetails, MovingDetails, Photo, Place, ServiceKind, ServiceRequest, ServiceStatus, TowDetails } from "@/types/domain";

export type RequestInput = {
  id?: string;
  kind: ServiceKind;
  origin: Place;
  destination: Place;
  stops?: Place[];
  clientId: string;
  providerId?: string;
  status?: ServiceStatus;
  createdAt?: string;
  scheduledFor?: string;
  tow?: TowDetails;
  cargo?: CargoDetails;
  moving?: MovingDetails;
  photos?: Photo[];
  pickupPhotos?: Photo[];
  instructions?: string;
  rating?: number;
  review?: string;
  paymentMethod?: ServiceRequest["paymentMethod"];
  /** Código promocional a aplicar (validado pelo servidor). */
  promoCode?: string;
};

/** Descrição curta da carga usada nos cartões e no detalhe do pedido. */
export function describeLoad(request: Pick<ServiceRequest, "kind" | "tow" | "cargo" | "moving">) {
  if (request.kind === "tow" && request.tow)
    return `${request.tow.brand} ${request.tow.model} · ${request.tow.plate}`;
  if (request.kind === "cargo" && request.cargo) return request.cargo.description || "Carga diversa";
  if (request.moving) return request.moving.items;
  return "";
}
