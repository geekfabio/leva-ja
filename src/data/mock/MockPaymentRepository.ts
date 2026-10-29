import type { Payment, PaymentMethodKind } from "@/types/domain";
import type { PaymentRepository } from "../repositories/PaymentRepository";
import { RepositoryError } from "../repositories/types";
import { db, type MockDatabase } from "./database";
import type { MockRequestRepository } from "./MockRequestRepository";
import { clone, later, simulate } from "./runtime";

/** Entidade de pagamentos simulada (no real: a atribuída pela EMIS ao processador). */
const ENTITY = "11223";
/** Quanto tempo o "banco" demora a confirmar uma referência paga. */
const BANK_CONFIRMATION_MS = 5000;

/**
 * Pagamentos do backend simulado. Cartão e numerário confirmam logo; a
 * referência Multicaixa fica pendente e o "banco" confirma passados uns
 * segundos, como faria a notificação do processador de pagamentos.
 */
export class MockPaymentRepository implements PaymentRepository {
  constructor(
    private readonly requests: MockRequestRepository,
    private readonly database: MockDatabase = db,
  ) {}

  private async confirm(payment: Payment) {
    if (payment.status !== "pending") return;
    payment.status = "confirmed";
    payment.confirmedAt = new Date().toISOString();
    // Confirmado: o pedido passa a pago (e o cliente recebe-o pelo tempo real).
    await this.requests.pay(payment.requestId, payment.method).catch(() => undefined);
  }

  async start(requestId: string, method: PaymentMethodKind) {
    const payment = await simulate<Payment>(() => {
      const request = this.database.requests.get(requestId);
      if (!request) throw new RepositoryError("not_found", "Pedido não encontrado.");
      if (request.status !== "delivered") throw new RepositoryError("invalid_transition", "O pagamento só é possível após a entrega.");
      // Idempotente: um pagamento pendente com o mesmo método é reutilizado.
      const open = [...this.database.payments.values()].find((p) => p.requestId === requestId && p.status === "pending" && p.method === method);
      if (open) return clone(open);

      const now = new Date();
      const payment: Payment = {
        id: `pay-${requestId}-${now.getTime().toString(36)}`,
        requestId,
        method,
        status: "pending",
        amount: request.price.total,
        createdAt: now.toISOString(),
      };
      if (method === "bank_reference") {
        const digits = `${request.code.replace(/\D/g, "")}${now.getTime() % 10_000}`.padStart(9, "0").slice(-9);
        payment.reference = { entity: ENTITY, reference: digits, expiresAt: new Date(now.getTime() + 48 * 3600_000).toISOString() };
        this.database.payments.set(payment.id, payment);
        later(BANK_CONFIRMATION_MS, () => void this.confirm(payment));
      } else {
        this.database.payments.set(payment.id, payment);
      }
      return payment;
    }, 600);
    // Cartão e numerário: confirmados de imediato, já com o pedido pago.
    if (payment.method !== "bank_reference") await this.confirm(payment);
    return clone(payment);
  }

  get(paymentId: string) {
    return simulate<Payment>(() => {
      const payment = this.database.payments.get(paymentId);
      if (!payment) throw new RepositoryError("not_found", "Pagamento não encontrado.");
      return clone(payment);
    }, 300);
  }
}
