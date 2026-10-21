import { CallScreen } from "@/components/service/CallScreen";
import { NoActiveRequest } from "@/components/service/NoActiveRequest";
import { useActiveClientRequest } from "@/features/service/useClientSimulation";
import { avatarFor, findProvider } from "@/mocks/people";

/** 25 · Chamada simulada com o prestador. */
export default function ClientCallScreen() {
  const request = useActiveClientRequest();
  const provider = findProvider(request?.providerId);
  if (!request || !provider) return <NoActiveRequest />;
  return (
    <CallScreen
      name={provider.name}
      initials={provider.initials}
      photo={avatarFor[provider.id]}
      subtitle={`${provider.vehicle.vehicleClass === "pickup" ? "Pickup " : ""}${provider.vehicle.brand} ${provider.vehicle.model}`}
      from={request.origin.area}
      to={request.destination.area}
    />
  );
}
