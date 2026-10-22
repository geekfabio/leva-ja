import type { PaymentMethod, SavedAddress } from "@/types/domain";

/** Dados da conta do cliente guardados no servidor (preferências do dispositivo ficam locais). */
export interface AccountRepository {
  addresses(clientId: string): Promise<SavedAddress[]>;
  addAddress(clientId: string, address: Omit<SavedAddress, "id">): Promise<SavedAddress>;
  removeAddress(clientId: string, id: string): Promise<void>;
  paymentMethods(clientId: string): Promise<PaymentMethod[]>;
  setDefaultPayment(clientId: string, id: string): Promise<PaymentMethod[]>;
  /** Regista um cartão (na API real: token do processador, nunca o número). */
  addCard(clientId: string, last4: string): Promise<PaymentMethod>;
}
