import type { ChatMessage } from "@/types/domain";
import { minutesFromNow } from "@/utils/date";

/** Conversa inicial de qualquer pedido activo (ref. 24). */
export const openingMessages = (requestId: string): ChatMessage[] => [
  { id: `${requestId}-m1`, requestId, from: "provider", text: "Olá, já estou a caminho.", at: minutesFromNow(-4), read: true },
  { id: `${requestId}-m2`, requestId, from: "client", text: "Obrigado. Estou junto ao portão principal.", at: minutesFromNow(-3), read: true },
  { id: `${requestId}-m3`, requestId, from: "provider", text: "Chego em cerca de 8 minutos.", at: minutesFromNow(-1), read: true },
];

/** Respostas automáticas usadas para simular o outro interlocutor. */
export const autoReplies: Record<"provider" | "client" | "support", string[]> = {
  provider: ["Recebido, obrigado!", "Combinado. Já estou perto.", "Sem problema, aguardo no local."],
  client: ["Perfeito, obrigado.", "Estou à espera.", "Ok, até já!"],
  support: [
    "Olá! Sou a Marta, do apoio Leva Já. Em que posso ajudar?",
    "Obrigada pela informação. Estou a verificar o teu pedido.",
    "Registei a ocorrência. Vais receber uma actualização em breve.",
  ],
};

