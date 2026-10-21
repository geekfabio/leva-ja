import { useLocalSearchParams } from "expo-router";
import { ChatThread } from "@/components/service/ChatThread";
import { avatarFor, findClient } from "@/mocks/people";
import { useRequest } from "@/stores/useServiceStore";
import { go } from "@/features/navigation";

/** Chat do prestador com o cliente do pedido. */
export default function ProviderChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const request = useRequest(id);
  const client = findClient(request?.clientId);
  return <ChatThread threadId={id ?? "req"} me="provider" replyAs="client" counterpart={{ name: client.name, initials: client.initials, photo: avatarFor[client.id], subtitle: "Cliente · Online" }} onCall={() => go(`/partner/call/${id}`)} />;
}
