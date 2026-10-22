import type { Provider, ProviderDocument, Review, ServiceKind, Transaction, Vehicle, Zone } from "@/types/domain";
import type { Unsubscribe } from "./types";

export type Coverage = { zones: string[]; services: ServiceKind[] };
export type PayoutAccount = { bank: string; iban: string; holder: string };
export type Wallet = { balance: number; transactions: Transaction[]; payout: PayoutAccount };
export type EarningsSummary = { today: number; todayCount: number; week: number; completed: number; chart: number[] };

export type ProviderState = {
  profile: Provider;
  online: boolean;
  coverage: Coverage;
  documents: ProviderDocument[];
  wallet: Wallet;
  declined: string[];
};

/** Área operacional do prestador: perfil, disponibilidade, cobertura, documentos e carteira. */
export interface ProviderRepository {
  getState(providerId: string): Promise<ProviderState>;
  setOnline(providerId: string, online: boolean): Promise<void>;
  updateVehicle(providerId: string, values: Partial<Vehicle>): Promise<Vehicle>;
  listZones(): Promise<Zone[]>;
  saveCoverage(providerId: string, coverage: Coverage): Promise<Coverage>;
  submitDocument(providerId: string, documentId: string): Promise<ProviderDocument>;
  decline(providerId: string, requestId: string): Promise<void>;
  withdraw(providerId: string, amount: number): Promise<Transaction>;
  earnings(providerId: string): Promise<EarningsSummary>;
  reviews(providerId: string): Promise<Review[]>;
  /** Alterações de estado (validação de documentos, levantamentos concluídos, novos ganhos). */
  subscribe(providerId: string, listener: (state: ProviderState) => void): Unsubscribe;
}
