import type {
  DeliveryProofData,
  Photo,
  Role,
  ServiceRequest,
  ServiceStatus,
} from "@/types/domain";
import type { RequestInput } from "@/features/booking/factory";
import type { Unsubscribe } from "./types";

export type RequestActor = Role | "system";

export type RequestQuery = {
  clientId?: string;
  providerId?: string;
  status?: ServiceStatus[];
};

export type NearbyRequest = { request: ServiceRequest; distanceKm: number };

/**
 * Pedidos de serviço e as suas transições. A implementação valida a máquina de
 * estados (no backend, o servidor é a autoridade) e devolve sempre o pedido
 * actualizado, com cliente e prestador incluídos.
 */
export interface RequestRepository {
  list(query?: RequestQuery): Promise<ServiceRequest[]>;
  get(id: string): Promise<ServiceRequest>;
  /** Pedidos à procura de prestador, perto do prestador indicado. */
  nearby(providerId: string): Promise<NearbyRequest[]>;
  create(input: Omit<RequestInput, "status" | "id">): Promise<ServiceRequest>;
  transition(id: string, to: ServiceStatus, actor: RequestActor): Promise<ServiceRequest>;
  accept(id: string, providerId: string): Promise<ServiceRequest>;
  cancel(id: string, reason: string): Promise<ServiceRequest>;
  submitProposal(id: string, providerId: string, amount: number, reason: string): Promise<ServiceRequest>;
  answerProposal(id: string, accepted: boolean): Promise<ServiceRequest>;
  addPickupPhotos(id: string, photos: Photo[]): Promise<ServiceRequest>;
  submitProof(id: string, proof: Omit<DeliveryProofData, "at">): Promise<ServiceRequest>;
  rate(id: string, rating: number, review?: string): Promise<ServiceRequest>;
  /** Alterações em tempo real (no backend: WebSocket ou push). */
  subscribe(listener: (request: ServiceRequest) => void): Unsubscribe;
}
