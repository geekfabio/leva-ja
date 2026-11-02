import type { DeliveryProofData, PaymentMethodKind, Photo, ServiceRequest, ServiceStatus, Transaction } from "@/types/domain";
import { buildRequest, type RequestInput } from "@/features/booking/factory";
import { providerEarningFor } from "@/features/booking/pricing";
import { canTransition, transitionActor } from "@/features/service/stateMachine";
import { serviceTitle } from "@/features/booking/catalog";
import { placeList } from "@/mocks/places";
import { roadDistanceKm } from "@/utils/geo";
import type { NearbyRequest, RequestActor, RequestQuery, RequestRepository } from "../repositories/RequestRepository";
import { RepositoryError } from "../repositories/types";
import { db, type MockDatabase } from "./database";
import { Emitter } from "./events";
import { simulate } from "./runtime";

/** Prestador que a simulação atribui a cada serviço, incluindo entregas leves por tuk-tuk. */
export const simulatedProviderFor = (input: Pick<ServiceRequest, "kind" | "cargo"> | ServiceRequest["kind"]) => {
  const request = typeof input === "string" ? { kind: input } : input;
  if (request.kind === "tow") return "prv-paulo";
  if (request.kind === "house_move") return "prv-teresa";
  if (request.kind === "cargo" && request.cargo?.vehicleClass === "tuk_tuk") return "prv-mateus";
  return "prv-joao";
};

const now = () => new Date().toISOString();

export class MockRequestRepository implements RequestRepository {
  private events = new Emitter<ServiceRequest>();

  constructor(private readonly database: MockDatabase = db) {}

  private find(id: string) {
    const request = this.database.requests.get(id);
    if (!request) throw new RepositoryError("not_found", "Pedido não encontrado.");
    return request;
  }

  /** Grava, notifica os subscritores e devolve a versão pública (com pessoas incluídas). */
  private save(request: ServiceRequest) {
    this.database.requests.set(request.id, request);
    const published = this.database.withPeople(request);
    this.events.emit("request", published);
    return published;
  }

  private change(id: string, fn: (r: ServiceRequest) => ServiceRequest) {
    return this.save(fn(this.find(id)));
  }

  private advance(r: ServiceRequest, status: ServiceStatus): ServiceRequest {
    return { ...r, status, timeline: [...r.timeline, { status, at: now() }] };
  }

  list(query: RequestQuery = {}) {
    return simulate(() =>
      [...this.database.requests.values()]
        .filter((r) => (!query.clientId || r.clientId === query.clientId) && (!query.providerId || r.providerId === query.providerId) && (!query.status || query.status.includes(r.status)))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((r) => this.database.withPeople(r)),
    );
  }

  get(id: string) {
    return simulate(() => this.database.withPeople(this.find(id)));
  }

  nearby(providerId: string) {
    return simulate<NearbyRequest[]>(() => {
      const record = this.database.providerRecord(providerId);
      const provider = this.database.providers.get(providerId);
      const base = placeList.find((p) => provider && p.coords.latitude === provider.coords.latitude && p.coords.longitude === provider.coords.longitude) ?? placeList[0]!;
      return [...this.database.requests.values()]
        .filter((r) => r.status === "searching" && !record.declined.includes(r.id) && record.coverage.services.includes(r.kind))
        .filter((r) => !r.proposal || r.proposal.status === "declined")
        .map((r) => ({ request: this.database.withPeople(r), distanceKm: Math.max(1, roadDistanceKm(base, r.origin) - 1) }))
        .sort((a, b) => a.distanceKm - b.distanceKm);
    });
  }

  create(input: Omit<RequestInput, "status" | "id">) {
    return simulate(() => this.save(buildRequest({ ...input, status: "searching" })));
  }

  transition(id: string, to: ServiceStatus, actor: RequestActor) {
    return simulate(() => {
      const r = this.find(id);
      if (!canTransition(r.status, to)) throw new RepositoryError("invalid_transition", `Não é possível passar de ${r.status} para ${to}.`);
      const expected = transitionActor[to];
      if (actor !== "system" && expected && expected !== actor) throw new RepositoryError("forbidden", "Esta acção pertence ao outro interveniente.");
      return this.save({ ...this.advance(r, to), providerId: to === "assigned" ? (r.providerId ?? simulatedProviderFor(r)) : r.providerId });
    });
  }

  accept(id: string, providerId: string) {
    return simulate(() => {
      const r = this.find(id);
      if (r.status !== "searching") throw new RepositoryError("invalid_transition", "Este pedido já não está disponível.");
      if (!this.database.providerRecord(providerId).online) throw new RepositoryError("forbidden", "Fica disponível para aceitar pedidos.");
      return this.save({ ...this.advance(r, "assigned"), providerId });
    });
  }

  cancel(id: string, reason: string) {
    return simulate(() => {
      const r = this.find(id);
      if (!canTransition(r.status, "cancelled")) throw new RepositoryError("invalid_transition", "Já não é possível cancelar após a recolha.");
      return this.save({ ...this.advance(r, "cancelled"), cancelReason: reason });
    });
  }

  submitProposal(id: string, providerId: string, amount: number, reason: string) {
    return simulate(() => {
      const r = this.find(id);
      if (r.status !== "searching") throw new RepositoryError("invalid_transition", "Este pedido já não aceita propostas.");
      return this.save({ ...r, providerId, proposal: { amount, reason, status: "sent" } });
    });
  }

  answerProposal(id: string, accepted: boolean) {
    return simulate(() => {
      const r = this.find(id);
      if (!r.proposal || r.proposal.status !== "sent") throw new RepositoryError("invalid_transition", "Não há proposta por responder.");
      if (!accepted) return this.save({ ...r, providerId: undefined, proposal: { ...r.proposal, status: "declined" } });
      const price = { ...r.price, total: r.proposal.amount + r.price.platformFee, extras: r.proposal.amount - r.price.base - r.price.distance };
      return this.save({ ...this.advance(r, "assigned"), price, providerEarning: providerEarningFor(price), proposal: { ...r.proposal, status: "accepted" } });
    });
  }

  addPickupPhotos(id: string, photos: Photo[]) {
    return simulate(() => this.change(id, (r) => ({ ...r, pickupPhotos: photos })));
  }

  submitProof(id: string, proof: Omit<DeliveryProofData, "at">) {
    return simulate(() => {
      const r = this.find(id);
      if (r.status !== "in_transit") throw new RepositoryError("invalid_transition", "O comprovativo só se regista durante o transporte.");
      const saved = this.save({ ...this.advance(r, "delivered"), proof: { ...proof, at: now() } });
      if (r.providerId) this.creditProvider(r);
      return saved;
    });
  }

  /** O "servidor" credita o ganho na carteira do prestador quando a entrega é confirmada. */
  private creditProvider(r: ServiceRequest) {
    const wallet = this.database.providerRecord(r.providerId!).wallet;
    if (wallet.transactions.some((t) => t.id === `tx-${r.id}`)) return;
    const tx: Transaction = { id: `tx-${r.id}`, kind: "earning", title: serviceTitle[r.kind], amount: r.providerEarning, at: now(), status: "completed", serviceKind: r.kind };
    wallet.transactions.unshift(tx);
    wallet.balance += tx.amount;
    providerChanges.emit(r.providerId!, r.providerId!);
  }

  pay(id: string, method: PaymentMethodKind) {
    return simulate(() => {
      const r = this.find(id);
      if (r.status !== "delivered") throw new RepositoryError("invalid_transition", "O pagamento só é possível após a entrega.");
      return this.save({ ...this.advance(r, "paid"), paymentMethod: method });
    });
  }

  rate(id: string, rating: number, review?: string) {
    return simulate(() => {
      const r = this.find(id);
      if (r.status !== "paid") throw new RepositoryError("invalid_transition", "Só é possível avaliar depois de pagar.");
      if (rating < 1 || rating > 5) throw new RepositoryError("validation", "A avaliação vai de 1 a 5.");
      return this.save({ ...this.advance(r, "rated"), rating, review });
    });
  }

  subscribe(listener: (request: ServiceRequest) => void) {
    return this.events.on("request", listener);
  }
}

/** Canal partilhado com o repositório do prestador para avisar alterações na carteira. */
export const providerChanges = new Emitter<string>();
