import { CallScreen } from "@/components/service/CallScreen";
import { NoActiveRequest } from "@/components/service/NoActiveRequest";
import { useActiveClientRequest } from "@/features/service/useClientSimulation";

/** 25 · Chamada simulada com o prestador. */
export default function ClientCallScreen() {
  const request = useActiveClientRequest();
  const provider = request?.provider;
  if (!request || !provider) return <NoActiveRequest />;
  return (
    <CallScreen
      name={provider.name}
      initials={provider.initials}
      photo={provider.avatar}
      subtitle={`${provider.vehicle.vehicleClass === "pickup" ? "Pickup " : provider.vehicle.vehicleClass === "tuk_tuk" ? "Tuk-tuk " : ""}${provider.vehicle.brand} ${provider.vehicle.model}`}
      from={request.origin.area}
      to={request.destination.area}
    />
  );
}
