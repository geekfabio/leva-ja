import type { ChatMessage, Client, PaymentMethod, Provider, SavedAddress, ServiceRequest } from "@/types/domain";
import type { ProviderState } from "../repositories/ProviderRepository";
import type { Session } from "../repositories/AuthRepository";
import { clients, providers } from "@/mocks/people";
import { seedRequests } from "@/mocks/requests";
import { initialBalance, initialTransactions, bankAccount } from "@/mocks/finance";
import { initialDocuments, initialServices, initialZones } from "@/mocks/provider";
import { initialAddresses, initialPaymentMethods } from "@/mocks/account";
import { clone } from "./runtime";
import { DEMO_CLIENT, DEMO_PROVIDER_ID, DEMO_TOKEN } from "./demo";

type ProviderRecord = Omit<ProviderState, "profile">;
type PendingAccount = { purpose: "register" | "recover"; client?: Client };
/** Sessão guardada no servidor simulado; sem `expiresAt` não expira (sessão de demonstração). */
export type SessionRecord = Omit<Session, "token" | "refreshToken"> & { expiresAt?: number; refreshToken?: string };

/**
 * Base de dados em memória que faz de servidor na fase mock. É semeada a partir
 * de `src/mocks` e só é acedida pelos repositórios mock (`src/data/mock`).
 */
export class MockDatabase {
  clients = new Map<string, Client>();
  providers = new Map<string, Provider>();
  requests = new Map<string, ServiceRequest>();
  providerState = new Map<string, ProviderRecord>();
  threads = new Map<string, ChatMessage[]>();
  addresses = new Map<string, SavedAddress[]>();
  paymentMethods = new Map<string, PaymentMethod[]>();
  pending = new Map<string, PendingAccount>();
  tickets: { code: string; requestId: string; reason: string; description: string }[] = [];
  /** Tokens de acesso emitidos. Não são apagados por `reset()`: repor os dados não termina a sessão. */
  sessions = new Map<string, SessionRecord>();
  /** Refresh tokens → token de acesso que renovam. */
  refreshTokens = new Map<string, string>();

  constructor() {
    this.seed();
    this.sessions.set(DEMO_TOKEN, { user: clone(DEMO_CLIENT), providerId: DEMO_PROVIDER_ID });
  }

  seed() {
    this.clients = new Map(clients.map((c) => [c.id, clone(c)]));
    this.providers = new Map(providers.map((p) => [p.id, clone(p)]));
    this.requests = new Map(seedRequests().map((r) => [r.id, r]));
    this.providerState = new Map(
      providers.map((p) => [
        p.id,
        {
          online: true,
          coverage: { zones: [...initialZones], services: [...initialServices] },
          documents: clone(initialDocuments),
          wallet: { balance: initialBalance, transactions: clone(initialTransactions), payout: { ...bankAccount } },
          declined: [],
        },
      ]),
    );
    this.threads = new Map();
    this.addresses = new Map(clients.map((c) => [c.id, clone(initialAddresses)]));
    this.paymentMethods = new Map(clients.map((c) => [c.id, clone(initialPaymentMethods)]));
    this.pending = new Map();
    this.tickets = [];
  }

  reset() {
    this.seed();
  }

  /** Pedido com cliente e prestador incluídos, como numa resposta da API. */
  withPeople(request: ServiceRequest): ServiceRequest {
    return clone({
      ...request,
      client: this.clients.get(request.clientId),
      provider: request.providerId ? this.providers.get(request.providerId) : undefined,
    });
  }

  providerRecord(providerId: string) {
    let record = this.providerState.get(providerId);
    if (!record) {
      record = { online: false, coverage: { zones: [], services: [] }, documents: [], wallet: { balance: 0, transactions: [], payout: { ...bankAccount } }, declined: [] };
      this.providerState.set(providerId, record);
    }
    return record;
  }
}

export const db = new MockDatabase();
