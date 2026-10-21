import type { PaymentMethod, SavedAddress } from "@/types/domain";
import type { AccountRepository } from "../repositories/AccountRepository";
import { RepositoryError } from "../repositories/types";
import { db, type MockDatabase } from "./database";
import { clone, simulate } from "./runtime";

export class MockAccountRepository implements AccountRepository {
  constructor(private readonly database: MockDatabase = db) {}

  private addressesOf(clientId: string) {
    if (!this.database.addresses.has(clientId)) this.database.addresses.set(clientId, []);
    return this.database.addresses.get(clientId)!;
  }

  private methodsOf(clientId: string) {
    if (!this.database.paymentMethods.has(clientId)) this.database.paymentMethods.set(clientId, []);
    return this.database.paymentMethods.get(clientId)!;
  }

  addresses(clientId: string) {
    return simulate(() => clone(this.addressesOf(clientId)));
  }

  addAddress(clientId: string, address: Omit<SavedAddress, "id">) {
    return simulate(() => {
      if (address.label.trim().length < 2) throw new RepositoryError("validation", "Indica um nome para o endereço.");
      const saved: SavedAddress = { ...address, id: `addr-${Date.now()}` };
      this.addressesOf(clientId).push(saved);
      return clone(saved);
    });
  }

  removeAddress(clientId: string, id: string) {
    return simulate(() => {
      this.database.addresses.set(clientId, this.addressesOf(clientId).filter((a) => a.id !== id));
    });
  }

  paymentMethods(clientId: string) {
    return simulate(() => clone(this.methodsOf(clientId)));
  }

  setDefaultPayment(clientId: string, id: string) {
    return simulate(() => {
      const methods = this.methodsOf(clientId).map((m) => ({ ...m, isDefault: m.id === id }));
      this.database.paymentMethods.set(clientId, methods);
      return clone(methods);
    });
  }

  addCard(clientId: string, last4: string) {
    return simulate(() => {
      if (!/^\d{4}$/.test(last4)) throw new RepositoryError("validation", "Cartão inválido.");
      const card: PaymentMethod = { id: `pm-card-${last4}-${Date.now()}`, kind: "card", title: "Cartão", detail: `Mastercard terminado em ${last4}`, isDefault: false };
      this.methodsOf(clientId).push(card);
      return clone(card);
    });
  }
}
