import type { ChatMessage } from "@/types/domain";
import type { Unsubscribe } from "./types";

export type ChatParticipant = ChatMessage["from"];
export type ChatEvent = { type: "message"; message: ChatMessage } | { type: "typing"; from: ChatParticipant; typing: boolean };

/** Conversas de um pedido ou com o suporte. */
export interface ChatRepository {
  messages(threadId: string, kind: "service" | "support"): Promise<ChatMessage[]>;
  send(threadId: string, from: ChatParticipant, text: string): Promise<ChatMessage>;
  markRead(threadId: string, reader: ChatParticipant): Promise<void>;
  subscribe(threadId: string, listener: (event: ChatEvent) => void): Unsubscribe;
}
