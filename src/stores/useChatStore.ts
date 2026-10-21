import { create } from "zustand";
import type { ChatMessage } from "@/types/domain";
import { autoReplies, openingMessages } from "@/mocks/chat";

type Sender = ChatMessage["from"];

type ChatState = {
  threads: Record<string, ChatMessage[]>;
  typing: Record<string, boolean>;
  ensureThread: (threadId: string, seed?: "service" | "support") => void;
  /** Envia e, na simulação, agenda a resposta automática do outro lado. */
  send: (threadId: string, from: Sender, text: string, replyAs?: Sender) => void;
  markRead: (threadId: string, reader: Sender) => void;
};

const replyIndex: Record<string, number> = {};

/** Conversas simuladas por pedido ("req-…") e com o suporte ("support"). Sem rede nem notificações reais. */
export const useChatStore = create<ChatState>((set, get) => ({
  threads: {},
  typing: {},
  ensureThread: (threadId, seed = "service") => {
    if (get().threads[threadId]) return;
    const initial =
      seed === "support"
        ? [{ id: `${threadId}-s0`, requestId: threadId, from: "support" as const, text: autoReplies.support[0]!, at: new Date().toISOString(), read: false }]
        : openingMessages(threadId);
    set((s) => ({ threads: { ...s.threads, [threadId]: initial } }));
  },
  send: (threadId, from, text, replyAs) => {
    const message: ChatMessage = { id: `${threadId}-${Date.now()}`, requestId: threadId, from, text: text.trim(), at: new Date().toISOString(), read: true };
    if (!message.text) return;
    set((s) => ({ threads: { ...s.threads, [threadId]: [...(s.threads[threadId] ?? []), message] } }));
    if (!replyAs) return;
    set((s) => ({ typing: { ...s.typing, [threadId]: true } }));
    setTimeout(() => {
      const options = autoReplies[replyAs];
      const key = `${threadId}-${replyAs}`;
      const index = (replyIndex[key] = ((replyIndex[key] ?? (replyAs === "support" ? 0 : -1)) + 1) % options.length);
      const reply: ChatMessage = { id: `${threadId}-r${Date.now()}`, requestId: threadId, from: replyAs, text: options[index]!, at: new Date().toISOString(), read: false };
      set((s) => ({
        typing: { ...s.typing, [threadId]: false },
        threads: { ...s.threads, [threadId]: [...(s.threads[threadId] ?? []), reply] },
      }));
    }, 1600);
  },
  markRead: (threadId, reader) =>
    set((s) => ({
      threads: {
        ...s.threads,
        [threadId]: (s.threads[threadId] ?? []).map((m) => (m.from !== reader ? { ...m, read: true } : m)),
      },
    })),
}));

export const unreadCount = (messages: ChatMessage[] | undefined, reader: Sender) =>
  (messages ?? []).filter((m) => m.from !== reader && !m.read).length;
