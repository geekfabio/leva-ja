import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeftRight,
  CircleHelp,
  CreditCard,
  History,
  MapPin,
  Pencil,
  Settings,
} from "lucide-react-native";
import {
  AppText,
  Avatar,
  Card,
  ListRow,
  ScreenContainer,
  SecondaryButton,
  VehicleImage,
  Appear,
} from "@/components/kit";
import { useSessionStore } from "@/stores/useSessionStore";
import { enterApp, go } from "@/features/navigation";
import { colors } from "@/theme/colors";

/** 31 · Perfil do cliente: histórico, endereços, pagamentos, definições e ajuda. */
export default function AccountScreen() {
  const user = useSessionStore((s) => s.user);
  const icon = { size: 24, color: colors.primary };
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenContainer edges={[]} gap={12} padded={false}>
        <SafeAreaView
          edges={["top"]}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingBottom: 56,
            overflow: "hidden",
            marginBottom: -56,
          }}
        >
          <View
            style={{
              position: "absolute",
              right: -10,
              bottom: -6,
              opacity: 0.35,
            }}
          >
            <VehicleImage art="tow" width={180} height={110} label="" />
          </View>
          <AppText
            variant="h1"
            color={colors.white}
            accessibilityRole="header"
            style={{ marginTop: 18 }}
          >
            O meu perfil
          </AppText>
        </SafeAreaView>
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <Card
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              padding: 18,
            }}
          >
            <Avatar
              name={user.name}
              initials={user.initials}
              photo={user.avatar}
              size={84}
              verified
            />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="h3">{user.name}</AppText>
              <AppText variant="caption" color={colors.muted}>
                {user.email}
              </AppText>
              <View style={{ alignSelf: "flex-start", marginTop: 8 }}>
                <SecondaryButton
                  tone="soft"
                  size="sm"
                  label="Editar perfil"
                  icon={<Pencil size={16} color={colors.primary} />}
                  onPress={() => go("/edit-profile")}
                />
              </View>
            </View>
          </Card>
          <Appear index={0} delay={120}>
            <ListRow
              icon={<History {...icon} />}
              title="Histórico de serviços"
              onPress={() => go("/trips")}
            />
          </Appear>
          <Appear index={1} delay={120}>
            <ListRow
              icon={<MapPin {...icon} />}
              title="Endereços guardados"
              onPress={() => go("/addresses")}
            />
          </Appear>
          <Appear index={2} delay={120}>
            <ListRow
              icon={<CreditCard {...icon} />}
              title="Métodos de pagamento"
              onPress={() => go("/payment-methods")}
            />
          </Appear>
          <Appear index={3} delay={120}>
            <ListRow
              icon={<Settings {...icon} />}
              title="Definições"
              onPress={() => go("/settings")}
            />
          </Appear>
          <Appear index={4} delay={120}>
            <ListRow
              icon={<CircleHelp {...icon} />}
              title="Ajuda e suporte"
              onPress={() => go("/help")}
            />
          </Appear>
          <Appear index={5} delay={120}>
            <ListRow
              icon={<ArrowLeftRight {...icon} />}
              title="Mudar para prestador"
              subtitle="Abre a área profissional (demonstração)"
              onPress={() => {
                useSessionStore.getState().setRole("provider");
                enterApp("provider");
              }}
            />
          </Appear>
        </View>
      </ScreenContainer>
    </View>
  );
}
