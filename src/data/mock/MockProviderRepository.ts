import type { ProviderDocument, Transaction, Vehicle } from "@/types/domain";
import { weeklyEarnings } from "@/mocks/finance";
import { availableZones } from "@/mocks/provider";
import { providerReviews } from "@/mocks/reviews";
import type { Coverage, ProviderRepository, ProviderState } from "../repositories/ProviderRepository";
import { RepositoryError } from "../repositories/types";
import { db, type MockDatabase } from "./database";
import { providerChanges } from "./MockRequestRepository";
import { clone, later, simulate } from "./runtime";

const sameDay = (iso: string, d = new Date()) => {
  const x = new Date(iso);
  return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth() && x.getDate() === d.getDate();
};

export class MockProviderRepository implements ProviderRepository {
  constructor(private readonly database: MockDatabase = db) {}

  private snapshot(providerId: string): ProviderState {
    const profile = this.database.providers.get(providerId);
    if (!profile) throw new RepositoryError("not_found", "Prestador não encontrado.");
    return clone({ profile, ...this.database.providerRecord(providerId) });
  }

  private changed(providerId: string) {
    providerChanges.emit(providerId, providerId);
  }

  getState(providerId: string) {
    return simulate(() => this.snapshot(providerId));
  }

  setOnline(providerId: string, online: boolean) {
    return simulate(() => {
      this.database.providerRecord(providerId).online = online;
      this.changed(providerId);
    });
  }

  updateVehicle(providerId: string, values: Partial<Vehicle>) {
    return simulate(() => {
      const profile = this.database.providers.get(providerId);
      if (!profile) throw new RepositoryError("not_found", "Prestador não encontrado.");
      profile.vehicle = { ...profile.vehicle, ...values };
      this.changed(providerId);
      return clone(profile.vehicle);
    });
  }

  listZones() {
    return simulate(() => clone(availableZones));
  }

  saveCoverage(providerId: string, coverage: Coverage) {
    return simulate(() => {
      if (!coverage.zones.length || !coverage.services.length) throw new RepositoryError("validation", "Escolhe pelo menos uma zona e um serviço.");
      this.database.providerRecord(providerId).coverage = clone(coverage);
      this.changed(providerId);
      return clone(coverage);
    });
  }

  /** O documento fica "em análise" e a equipa (simulada) valida-o passados uns segundos. */
  submitDocument(providerId: string, documentId: string) {
    return simulate(() => {
      const record = this.database.providerRecord(providerId);
      const doc = record.documents.find((d) => d.id === documentId);
      if (!doc) throw new RepositoryError("not_found", "Documento não encontrado.");
      doc.state = "pending";
      this.changed(providerId);
      later(4000, () => {
        const next = new Date();
        next.setFullYear(next.getFullYear() + 2);
        doc.state = "verified";
        doc.validUntil = next.toISOString();
        this.changed(providerId);
      });
      return clone(doc) as ProviderDocument;
    });
  }

  decline(providerId: string, requestId: string) {
    return simulate(() => {
      const record = this.database.providerRecord(providerId);
      if (!record.declined.includes(requestId)) record.declined.push(requestId);
      this.changed(providerId);
    });
  }

  /** Levantamento pendente que a transferência (simulada) conclui em poucos segundos. */
  withdraw(providerId: string, amount: number) {
    return simulate(() => {
      const wallet = this.database.providerRecord(providerId).wallet;
      if (amount < 1000) throw new RepositoryError("validation", "O levantamento mínimo é 1 000 Kz.");
      if (amount > wallet.balance) throw new RepositoryError("validation", "O valor é superior ao saldo disponível.");
      const tx: Transaction = { id: `tx-wd-${Date.now()}`, kind: "withdrawal", title: "Levantamento para conta bancária", amount: -amount, at: new Date().toISOString(), status: "pending" };
      wallet.transactions.unshift(tx);
      wallet.balance -= amount;
      this.changed(providerId);
      later(3000, () => {
        tx.status = "completed";
        this.changed(providerId);
      });
      return clone(tx);
    });
  }

  earnings(providerId: string) {
    return simulate(() => {
      const { wallet } = this.database.providerRecord(providerId);
      const earnings = wallet.transactions.filter((t) => t.kind === "earning" && t.status === "completed");
      const today = earnings.filter((t) => sameDay(t.at));
      const weekAgo = Date.now() - 7 * 86_400_000;
      const completed = [...this.database.requests.values()].filter((r) => r.providerId === providerId && ["delivered", "paid", "rated"].includes(r.status)).length;
      const todayTotal = today.reduce((s, t) => s + t.amount, 0);
      const todayIndex = (new Date().getDay() + 6) % 7;
      return {
        today: todayTotal,
        todayCount: today.length,
        // A série semanal mistura o histórico mock com os ganhos reais de hoje.
        week: earnings.filter((t) => new Date(t.at).getTime() >= weekAgo).reduce((s, t) => s + t.amount, 0) + 40000,
        completed: completed + 8,
        chart: weeklyEarnings.map((v, i) => (i === todayIndex ? Math.max(v, todayTotal) : v)),
      };
    });
  }

  reviews(providerId: string) {
    return simulate(() => clone(providerReviews.filter((r) => [...this.database.requests.values()].some((q) => q.id === r.requestId && q.providerId === providerId))));
  }

  subscribe(providerId: string, listener: (state: ProviderState) => void) {
    return providerChanges.on(providerId, () => listener(this.snapshot(providerId)));
  }
}
