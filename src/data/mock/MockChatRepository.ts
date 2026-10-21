import type { ChatMessage } from "@/types/domain";
import { autoReplies, openingMessages } from "@/mocks/chat";
import type { ChatEvent, ChatParticipant, ChatRepository } from "../repositories/ChatRepository";
import { db, type MockDatabase } from "./database";
import { Emitter } from "./events";
import { clone, later, simulate } from "./runtime";

/**
 * Chat simulado: guarda as mensagens na base mock e responde automaticamente
 * pelo outro interveniente (com indicação "a escrever…").
 */
export class MockChatRepository implements ChatRepository {
  private events = new Emitter<ChatEvent>();
  private replyIndex = new Map<string, number>();

  constructor(private readonly database: MockDatabase = db) {}

  private thread(threadId: string, kind: "service" | "support") {
    let messages = this.database.threads.get(threadId);
    if (!messages) {
      messages =
        kind === "support"
          ? [{ id: `${threadId}-s0`, requestId: threadId, from: "support", text: autoReplies.support[0]!, at: new Date().toISOString(), read: false }]
          : openingMessages(threadId);
      this.database.threads.set(threadId, messages);
    }
    return messages;
  }

  messages(threadId: string, kind: "service" | "support") {
    return simulate(() => clone(this.thread(threadId, kind)), 150);
  }

  send(threadId: string, from: ChatParticipant, text: string) {
    return simulate(() => {
      const kind = threadId.startsWith("support") ? "support" : "service";
      const message: ChatMessage = { id: `${threadId}-${Date.now()}`, requestId: threadId, from, text: text.trim(), at: new Date().toISOString(), read: true };
      this.thread(threadId, kind).push(message);
      this.events.emit(threadId, { type: "message", message: clone(message) });
      this.autoReply(threadId, kind === "support" ? "support" : from === "client" ? "provider" : "client");
      return clone(message);
    }, 120);
  }

  private autoReply(threadId: string, as: ChatParticipant) {
    this.events.emit(threadId, { type: "typing", from: as, typing: true });
    later(1600, () => {
      const options = autoReplies[as];
      const index = ((this.replyIndex.get(`${threadId}-${as}`) ?? (as === "support" ? 0 : -1)) + 1) % options.length;
      this.replyIndex.set(`${threadId}-${as}`, index);
      const reply: ChatMessage = { id: `${threadId}-r${Date.now()}`, requestId: threadId, from: as, text: options[index]!, at: new Date().toISOString(), read: false };
      this.database.threads.get(threadId)?.push(reply);
      this.events.emit(threadId, { type: "typing", from: as, typing: false });
      this.events.emit(threadId, { type: "message", message: clone(reply) });
    });
  }

  markRead(threadId: string, reader: ChatParticipant) {
    return simulate(() => {
      this.database.threads.get(threadId)?.forEach((m) => {
        if (m.from !== reader) m.read = true;
      });
    }, 0);
  }

  subscribe(threadId: string, listener: (event: ChatEvent) => void) {
    return this.events.on(threadId, listener);
  }
}
