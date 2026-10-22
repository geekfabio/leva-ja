import type { PaymentMethodKind } from "@/types/domain";

/** Textos dos métodos de pagamento (iguais em qualquer origem de dados). */
export const paymentKindCopy: Record<PaymentMethodKind, { title: string; detail: string }> = {
  bank_reference: { title: "Referência bancária", detail: "Paga via Multicaixa ou Internet Banking." },
  card: { title: "Cartão", detail: "Visa, Mastercard ou cartão Multicaixa." },
  cash: { title: "Pagamento em numerário", detail: "Paga em dinheiro ao prestador." },
};
