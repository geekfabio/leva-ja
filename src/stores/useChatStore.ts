import { create } from "zustand";
import type { ChatMessage } from "@/types/domain";
import { repositories, type ChatParticipant } from "@/data";

type ChatState = {
  threads: Record<string, ChatMessage[]>;
  typing: Record<string, boolean>;
  /** Carrega a conversa e subscreve mensagens novas; devolve a função para sair. */
  open: (threadId: string, kind?: "service" | "support") => () => void;
  send: (threadId: string, from: ChatParticipant, text: string) => Promise<void>;
  markRead: (threadId: string, reader: ChatParticipant) => void;
};

/** Cache das conversas sobre o ChatRepository (respostas e "a escrever…" chegam por subscrição). */
export const useChatStore = create<ChatState>((set) => {
  const append = (threadId: string, message: ChatMessage) =>
    set((s) => {
      const list = s.threads[threadId] ?? [];
      return list.some((m) => m.id === message.id) ? s : { threads: { ...s.threads, [threadId]: [...list, message] } };
    });
  return {
    threads: {},
    typing: {},
    open: (threadId, kind = "service") => {
      repositories()
        .chat.messages(threadId, kind)
        .then((messages) => set((s) => ({ threads: { ...s.threads, [threadId]: messages } })))
        .catch(() => undefined);
      return repositories().chat.subscribe(threadId, (event) => {
        if (event.type === "message") append(threadId, event.message);
        else set((s) => ({ typing: { ...s.typing, [threadId]: event.typing } }));
      });
    },
    send: async (threadId, from, text) => {
      if (!text.trim()) return;
      await repositories().chat.send(threadId, from, text);
    },
    markRead: (threadId, reader) => {
      set((s) => ({ threads: { ...s.threads, [threadId]: (s.threads[threadId] ?? []).map((m) => (m.from !== reader ? { ...m, read: true } : m)) } }));
      repositories().chat.markRead(threadId, reader).catch(() => undefined);
    },
  };
});

export const unreadCount = (messages: ChatMessage[] | undefined, reader: ChatParticipant) =>
  (messages ?? []).filter((m) => m.from !== reader && !m.read).length;
