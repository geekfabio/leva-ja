import { View } from "react-native";
import {
  ArrowLeftRight,
  ChevronRight,
  CircleHelp,
  FileText,
  MapPin,
  Settings,
  Star,
} from "lucide-react-native";
import {
  AppText,
  Avatar,
  Card,
  ListRow,
  PlateTag,
  ScreenContainer,
  StatusBadge,
  VehicleImage,
  Appear,
} from "@/components/kit";
import { useProviderStore } from "@/stores/useProviderStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { formatRating } from "@/utils/format";
import { enterApp, go } from "@/features/navigation";
import { colors } from "@/theme/colors";
import { useMyProvider } from "@/features/provider/useProvider";

/** 41 · Perfil profissional do prestador. */
export default function ProviderProfile() {
  const me = useMyProvider();
  const vehicle = me.vehicle;
  const docsPending = useProviderStore(
    (s) => s.documents.filter((d) => d.state !== "verified").length,
  );
  const icon = { size: 24, color: colors.primary };
  return (
    <ScreenContainer gap={12} contentStyle={{ paddingTop: 16 }}>
      <AppText
        variant="display"
        accessibilityRole="header"
        style={{ fontSize: 34 }}
      >
        Perfil
      </AppText>
      <Card style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
        <Avatar
          name={me.name}
          initials={me.initials}
          photo={me.avatar}
          size={96}
          verified
        />
        <View style={{ flex: 1, gap: 6 }}>
          <AppText variant="h2">{me.name}</AppText>
          <StatusBadge
            label="Prestador verificado"
            tone="success"
            icon="check"
          />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Star size={18} color={colors.star} fill={colors.star} />
            <AppText variant="label" weight="bold">
              {formatRating(me.rating)}
            </AppText>
            <AppText variant="caption" color={colors.muted}>
              · {me.reviewsCount} avaliações
            </AppText>
          </View>
        </View>
      </Card>
      <Card
        onPress={() => go("/partner/vehicle")}
        accessibilityLabel={`A minha viatura: ${vehicle.brand} ${vehicle.model}, ${vehicle.plate}`}
        style={{ gap: 8 }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <AppText variant="h3">A minha viatura</AppText>
          <ChevronRight size={22} color={colors.text} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <VehicleImage art="pickup" width={170} height={104} />
          <View style={{ gap: 2 }}>
            <AppText variant="caption" color={colors.muted}>
              {vehicle.brand}
            </AppText>
            <AppText variant="h2">{vehicle.model}</AppText>
            <PlateTag plate={vehicle.plate} />
          </View>
        </View>
      </Card>
      <Appear index={0} delay={120}>
        <ListRow
          icon={<FileText {...icon} />}
          title="Documentos"
          subtitle={
            docsPending ? `${docsPending} por actualizar` : "Todos verificados"
          }
          onPress={() => go("/partner/documents")}
        />
      </Appear>
      <Appear index={1} delay={120}>
        <ListRow
          icon={<MapPin {...icon} />}
          title="Zonas e serviços"
          onPress={() => go("/partner/zones")}
        />
      </Appear>
      <Appear index={2} delay={120}>
        <ListRow
          icon={<Settings {...icon} />}
          title="Definições"
          onPress={() => go("/settings")}
        />
      </Appear>
      <Appear index={3} delay={120}>
        <ListRow
          icon={<CircleHelp {...icon} />}
          title="Ajuda e suporte"
          onPress={() => go("/help")}
        />
      </Appear>
      <Appear index={4} delay={120}>
        <ListRow
          icon={<ArrowLeftRight {...icon} />}
          title="Mudar para cliente"
          subtitle="Abre a área de pedidos (demonstração)"
          onPress={() => {
            useSessionStore.getState().setRole("client");
            enterApp("client");
          }}
        />
      </Appear>
    </ScreenContainer>
  );
}
