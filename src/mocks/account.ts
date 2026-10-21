import type { HelpTopic, PaymentMethod, SavedAddress } from "@/types/domain";
import { places } from "./places";

export const initialAddresses: SavedAddress[] = [
  { id: "addr-home", label: "Casa", place: places.ingombota, icon: "home" },
  { id: "addr-work", label: "Trabalho", place: places.talatona, icon: "work" },
  { id: "addr-mother", label: "Casa da mãe", place: places.kilamba, icon: "pin" },
];

export const initialPaymentMethods: PaymentMethod[] = [
  { id: "pm-ref", kind: "bank_reference", title: "Referência bancária", detail: "Paga via Multicaixa ou Internet Banking.", isDefault: true },
  { id: "pm-card", kind: "card", title: "Cartão", detail: "Visa terminado em 4821", isDefault: false },
  { id: "pm-cash", kind: "cash", title: "Pagamento em numerário", detail: "Paga em dinheiro ao prestador.", isDefault: false },
];

export const paymentKindCopy = {
  bank_reference: { title: "Referência bancária", detail: "Paga via Multicaixa ou Internet Banking." },
  card: { title: "Cartão", detail: "Visa, Mastercard ou cartão Multicaixa." },
  cash: { title: "Pagamento em numerário", detail: "Paga em dinheiro ao prestador." },
} as const;

export const helpTopics: HelpTopic[] = [
  { id: "faq-1", category: "orders", question: "Como acompanho o meu pedido?", answer: "Depois de o prestador aceitar, o mapa mostra a posição dele e o tempo estimado. Também recebes notificações em cada etapa." },
  { id: "faq-2", category: "orders", question: "Posso cancelar um pedido?", answer: "Sim, enquanto a carga ou viatura não tiver sido recolhida. Depois da recolha, fala com o suporte." },
  { id: "faq-3", category: "payments", question: "Quando é que pago o serviço?", answer: "Só pagas depois de confirmarmos o prestador e os detalhes do serviço. O valor final aparece antes da confirmação." },
  { id: "faq-4", category: "payments", question: "Como obtenho o recibo?", answer: "O recibo fica disponível no histórico de serviços logo após o pagamento." },
  { id: "faq-5", category: "safety", question: "Os prestadores são verificados?", answer: "Todos os prestadores enviam carta de condução, identificação, documentos da viatura e seguro, validados pela equipa Leva Já." },
  { id: "faq-6", category: "safety", question: "O que faz o botão SOS?", answer: "Partilha a tua localização e o pedido activo com a equipa de segurança e mostra os contactos de emergência." },
  { id: "faq-7", category: "account", question: "Como altero o meu número de telefone?", answer: "Em Perfil → Editar perfil. Vais receber um código para confirmar o novo número." },
];

export const emergencyContacts = [
  { id: "sos-police", label: "Polícia Nacional", number: "113" },
  { id: "sos-fire", label: "Bombeiros", number: "115" },
  { id: "sos-ambulance", label: "Emergência médica", number: "112" },
  { id: "sos-levaja", label: "Segurança Leva Já", number: "+244 222 000 111" },
];
