import { ChatThread } from "@/components/service/ChatThread";
import { useSessionStore } from "@/stores/useSessionStore";

/** Conversa simulada com o apoio ao cliente. */
export default function SupportChatScreen() {
  const role = useSessionStore((s) => s.role) ?? "client";
  return <ChatThread threadId={`support-${role}`} me={role} seed="support" counterpart={{ name: "Marta · Apoio AngoLeva", initials: "AL", subtitle: "Online · responde em ~2 min" }} />;
}
