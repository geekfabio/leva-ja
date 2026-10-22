import { useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { AppText, IconButton, PrimaryButton, SelectionCard } from "@/components/kit";
import { illustrations } from "@/theme/images";
import { useSessionStore } from "@/stores/useSessionStore";
import { go, swap } from "@/features/navigation";
import type { Role } from "@/types/domain";
import { colors } from "@/theme/colors";

/** 05 · Escolha de perfil: cliente ou prestador. */
export default function ProfileSelectScreen() {
  const current = useSessionStore((s) => s.role);
  const [role, setRole] = useState<Role>(current ?? "client");
  const confirm = () => {
    useSessionStore.getState().setRole(role);
    go("/login");
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: colors.deep }}>
        <SafeAreaView edges={["top"]} style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          <IconButton label="Voltar ao onboarding" icon={<ArrowLeft size={24} color={colors.white} />} onPress={() => swap("/intro")} />
          <AppText variant="h1" color={colors.white} accessibilityRole="header" style={{ marginTop: 12, fontSize: 32, lineHeight: 38 }}>
            Como vais usar{"\n"}a Leva Já?
          </AppText>
        </SafeAreaView>
        <Svg width="100%" height={36} viewBox="0 0 400 36" preserveAspectRatio="none" style={{ position: "absolute", bottom: -1 }}>
          <Path d="M0 36 L0 30 Q 220 40 400 0 L400 36 Z" fill={colors.background} />
        </Svg>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 20, gap: 14, paddingTop: 8 }} accessibilityRole="radiogroup">
        <SelectionCard
          layout="tile"
          title="Preciso de um serviço"
          description="Reboque, carga ou mudança"
          selected={role === "client"}
          onPress={() => setRole("client")}
          style={{ flex: 1, maxHeight: 250 }}
          media={<Image source={illustrations.profileClient} style={{ width: "100%", flex: 1, minHeight: 110, borderRadius: 12 }} contentFit="contain" accessibilityLabel="" />}
        />
        <SelectionCard
          layout="tile"
          title="Sou prestador"
          description="Recebo pedidos e presto serviços"
          selected={role === "provider"}
          onPress={() => setRole("provider")}
          style={{ flex: 1, maxHeight: 250 }}
          media={<Image source={illustrations.profileProvider} style={{ width: "100%", flex: 1, minHeight: 110, borderRadius: 12 }} contentFit="contain" accessibilityLabel="" />}
        />
      </View>
      <SafeAreaView edges={["bottom"]} style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, gap: 10 }}>
        <PrimaryButton label="Continuar" onPress={confirm} trailingIcon={<ArrowRight size={22} color={colors.white} />} />
        <AppText variant="caption" color={colors.muted} align="center">
          Podes alterar mais tarde nas definições.
        </AppText>
      </SafeAreaView>
    </View>
  );
}
