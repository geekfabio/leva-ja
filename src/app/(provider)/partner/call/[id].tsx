import { useLocalSearchParams } from "expo-router";
import { CallScreen } from "@/components/service/CallScreen";
import { useRequest } from "@/stores/useServiceStore";
import { serviceTitle } from "@/features/booking/catalog";
import { clientOf } from "@/features/service/people";

/** Chamada simulada do prestador para o cliente. */
export default function ProviderCallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const request = useRequest(id);
  const client = clientOf(request);
  return <CallScreen name={client.name} initials={client.initials} photo={client.avatar} subtitle={request ? serviceTitle[request.kind] : "Cliente"} from={request?.origin.area ?? ""} to={request?.destination.area ?? ""} />;
}
