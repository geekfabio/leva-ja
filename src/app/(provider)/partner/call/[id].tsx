import { useLocalSearchParams } from "expo-router";
import { CallScreen } from "@/components/service/CallScreen";
import { avatarFor, findClient } from "@/mocks/people";
import { useRequest } from "@/stores/useServiceStore";
import { serviceTitle } from "@/features/booking/catalog";

/** Chamada simulada do prestador para o cliente. */
export default function ProviderCallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const request = useRequest(id);
  const client = findClient(request?.clientId);
  return <CallScreen name={client.name} initials={client.initials} photo={avatarFor[client.id]} subtitle={request ? serviceTitle[request.kind] : "Cliente"} from={request?.origin.area ?? ""} to={request?.destination.area ?? ""} />;
}
