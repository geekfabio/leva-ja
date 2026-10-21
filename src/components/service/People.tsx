import {View} from "react-native";
import { ArrowRight, BadgeCheck, ChevronRight, Clock3, MapPin, Route, Star } from "lucide-react-native";
import type { Client, Place, Provider } from "@/types/domain";
import { avatarFor } from "@/mocks/people";
import { formatKm, formatRating } from "@/utils/format";
import { colors, radius } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import { Avatar } from "@/components/core/Avatar";
import { VehicleImage } from "./Media";
import { ScalePressable } from "@/components/core/Motion";

const artFor = (provider: Provider) =>
  ({ pickup: "pickup", tow_truck: "tow", van: "van", truck: "box" } as const)[provider.vehicle.vehicleClass];

/** Prestador com avaliação e viatura (ref. 22, 23, 28). */
export function ProviderCard({
  provider,
  layout = "inline",
  onPress,
  subtitle,
}: {
  provider: Provider;
  layout?: "inline" | "stacked" | "rating";
  onPress?: () => void;
  subtitle?: string;
}) {
  const vehicleName = `${provider.vehicle.categoryLabel.startsWith("Pickup") ? "Pickup " : ""}${provider.vehicle.brand} ${provider.vehicle.model}`;
  const body = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
      <Avatar name={provider.name} initials={provider.initials} photo={avatarFor[provider.id]} size={layout === "stacked" ? 84 : 60} verified={layout === "stacked"} online={layout === "inline"} />
      <View style={{ flex: 1, gap: 3 }}>
        <AppText variant={layout === "stacked" ? "h2" : "h3"}>{provider.name}</AppText>
        {layout === "inline" ? (
          <AppText variant="caption" color={colors.muted}>
            {subtitle ?? vehicleName}
          </AppText>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Star size={18} color={colors.star} fill={colors.star} />
            <AppText variant="title">{formatRating(provider.rating)}</AppText>
            {layout === "rating" ? (
              <AppText variant="caption" color={colors.muted}>
                ({provider.reviewsCount})
              </AppText>
            ) : null}
          </View>
        )}
      </View>
      {layout === "inline" ? <VehicleImage art={artFor(provider)} width={116} height={64} label={vehicleName} /> : null}
      {onPress ? <ChevronRight size={22} color={colors.text} /> : null}
    </View>
  );
  if (!onPress) return body;
  return (
    <ScalePressable accessibilityRole="button" accessibilityLabel={`${provider.name}, ver detalhes`} onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
      {body}
    </ScalePressable>
  );
}

/** Viatura do prestador com matrícula (ref. 22, 26). */
export function VehicleRow({ provider, eta }: { provider: Provider; eta?: number }) {
  return (
    <View style={{ borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12 }}>
        <VehicleImage art={artFor(provider)} width={130} height={78} />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="title">
            {provider.vehicle.vehicleClass === "pickup" ? "Pickup " : ""}
            {provider.vehicle.brand} {provider.vehicle.model}
          </AppText>
          <AppText variant="caption" color={colors.muted}>
            {provider.vehicle.brand} {provider.vehicle.model} • {provider.vehicle.color}
          </AppText>
          <PlateTag plate={provider.vehicle.plate} />
        </View>
      </View>
      {eta !== undefined ? (
        <View style={{ borderTopWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12 }}>
          <Clock3 size={20} color={colors.primary} />
          <AppText variant="title" weight="semibold">
            Chega em{" "}
            <AppText variant="title" color={colors.primary}>
              {eta} min
            </AppText>
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

export function PlateTag({ plate }: { plate: string }) {
  return (
    <View accessibilityLabel={`Matrícula ${plate}`} style={{ alignSelf: "flex-start", backgroundColor: "#EEF2EF", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginTop: 2 }}>
      <AppText variant="label" weight="bold">
        {plate}
      </AppText>
    </View>
  );
}

/** Cliente no lado do prestador (ref. 35, 36, 45). */
export function ClientLine({ client, prefix = "Cliente:" }: { client: Client; prefix?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <AppText variant="body" color={colors.text}>
        {prefix}{" "}
        <AppText variant="body" weight="bold">
          {client.name}
        </AppText>
      </AppText>
      <BadgeCheck size={16} color={colors.white} fill={colors.accent} />
    </View>
  );
}

/** "Ingombota → Talatona · 18 km" (ref. 20, 35). */
export function RouteSummary({ origin, destination, distanceKm, emphasis = "md" }: { origin: Place; destination: Place; distanceKm?: number; emphasis?: "md" | "lg" }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }} accessible accessibilityLabel={`De ${origin.area} para ${destination.area}${distanceKm ? `, ${distanceKm} quilómetros` : ""}`}>
      {emphasis === "lg" ? <MapPin size={30} color={colors.white} fill={colors.accent} /> : <Route size={26} color={colors.ink} />}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <AppText variant={emphasis === "lg" ? "h3" : "title"}>{origin.area}</AppText>
          <ArrowRight size={18} color={colors.ink} />
          <AppText variant={emphasis === "lg" ? "h3" : "title"}>{destination.area}</AppText>
        </View>
        {distanceKm !== undefined ? (
          <AppText variant="caption" color={colors.muted}>
            {emphasis === "lg" ? formatKm(distanceKm) : `Distância estimada: ${formatKm(distanceKm)}`}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}
