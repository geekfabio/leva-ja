import { Text, View } from "react-native";
import { VehicleArt } from "@/components/transport/VehicleArt";
import { VehicleId, vehicles } from "@/domain/catalog";
import { AppCard } from "@/components/ui/AppCard";
export function ServiceSummary({
  service,
  vehicle,
  origin,
  destination,
  description,
}: {
  service: string;
  vehicle: VehicleId;
  origin: string;
  destination?: string;
  description?: string;
}) {
  return (
    <AppCard>
      <View className="flex-row items-center gap-2">
        <VehicleArt vehicle={vehicle} size={104} />
        <View className="flex-1">
          <Text className="text-xs font-semibold text-brand">
            O TEU SERVIÇO
          </Text>
          <Text className="mt-1 text-xl font-bold text-ink dark:text-white">
            {service}
          </Text>
          <Text className="mt-1 text-sm text-muted">
            {vehicles[vehicle].name}
          </Text>
        </View>
      </View>
      <View className="mt-3 border-t border-line pt-4">
        <Text className="text-xs font-semibold text-muted">
          RECOLHA / LOCAL DO SERVIÇO
        </Text>
        <Text className="mt-1 text-base text-ink dark:text-white">
          {origin}
        </Text>
        {destination ? (
          <>
            <Text className="mt-4 text-xs font-semibold text-muted">
              DESTINO
            </Text>
            <Text className="mt-1 text-base text-ink dark:text-white">
              {destination}
            </Text>
          </>
        ) : null}
        {description ? (
          <Text className="mt-4 text-sm leading-6 text-muted">
            {description}
          </Text>
        ) : null}
      </View>
    </AppCard>
  );
}
