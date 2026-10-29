import type { Payment, PaymentMethodKind } from "@/types/domain";

/**
 * Pagamentos. Iniciar um pagamento devolve-o com o estado: cartão e numerário
 * ficam logo confirmados; a referência Multicaixa fica pendente até o banco
 * confirmar. Quando confirma, o pedido passa a `paid` e chega pelo tempo real.
 */
export interface PaymentRepository {
  start(requestId: string, method: PaymentMethodKind): Promise<Payment>;
  get(paymentId: string): Promise<Payment>;
}
