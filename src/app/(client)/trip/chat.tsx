import { ChatThread } from "@/components/service/ChatThread";
import { NoActiveRequest } from "@/components/service/NoActiveRequest";
import { useActiveClientRequest } from "@/features/service/useClientSimulation";
import { avatarFor, findProvider } from "@/mocks/people";
import { go } from "@/features/navigation";

/** 24 · Chat com o prestador do pedido activo. */
export default function ClientChatScreen() {
  const request = useActiveClientRequest();
  const provider = findProvider(request?.providerId);
  if (!request || !provider) return <NoActiveRequest />;
  return (
    <ChatThread
      threadId={request.id}
      me="client"
      replyAs="provider"
      counterpart={{ name: provider.name, initials: provider.initials, photo: avatarFor[provider.id] }}
      onCall={() => go("/trip/call")}
    />
  );
}
