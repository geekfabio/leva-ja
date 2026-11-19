import { useLocalSearchParams } from "expo-router";
import { ChatThread } from "@/components/service/ChatThread";
import { useRequest } from "@/stores/useServiceStore";
import { callPhone } from "@/features/service/contact";
import { clientOf } from "@/features/service/people";

/** Chat do prestador com o cliente do pedido. */
export default function ProviderChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const request = useRequest(id);
  const client = clientOf(request);
  return <ChatThread threadId={id ?? "req"} me="provider" counterpart={{ name: client.name, initials: client.initials, photo: client.avatar, subtitle: "Cliente · Online" }} onCall={() => callPhone(client.phone)} />;
}
