import { useRef } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ChevronDown, MapPin } from "lucide-react-native";
import { AppText, BrandLogo, ListRow, ScreenContainer, ServiceCatalogCard, SheetModal, StatusBadge, Appear } from "@/components/kit";
import { serviceCatalog } from "@/features/booking/catalog";
import { startBooking } from "@/features/booking/useBookingFlow";
import { colors } from "@/theme/colors";

const cities = [
  { name: "Luanda", available: true },
  { name: "Benguela", available: false },
  { name: "Huambo", available: false },
];

/** 12 · Categoria de serviço: o formulário seguinte depende da escolha. */
export default function ServicesScreen() {
  const citySheet = useRef<BottomSheetModal>(null);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.primary }}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12 }}>
          <View style={{ flex: 1 }}>
            <BrandLogo inverse size="sm" tagline="Transporta o que precisas" />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Cidade: Luanda. Alterar" onPress={() => citySheet.current?.present()} style={{ flexDirection: "row", alignItems: "center", gap: 4, minHeight: 44 }}>
            <MapPin size={18} color={colors.white} fill={colors.white} />
            <AppText variant="label" color={colors.white}>
              Luanda
            </AppText>
            <ChevronDown size={18} color={colors.white} />
          </Pressable>
        </View>
      </SafeAreaView>
      <ScreenContainer edges={[]} gap={14} contentStyle={{ paddingTop: 24 }}>
        <AppText variant="display" accessibilityRole="header" style={{ marginBottom: 10 }}>
          O que precisas{"\n"}transportar?
        </AppText>
        {serviceCatalog.map((service, i) => (
          <Appear key={service.title} index={i}>
            <ServiceCatalogCard service={service} onPress={() => startBooking(service.kind, service.variant)} />
          </Appear>
        ))}
      </ScreenContainer>
      <SheetModal ref={citySheet} title="Onde precisas do serviço?">
        {cities.map((city) => (
          <ListRow
            key={city.name}
            variant="plain"
            title={city.name}
            icon={<MapPin size={22} color={city.available ? colors.primary : colors.subtle} />}
            right={<StatusBadge label={city.available ? "Disponível" : "Em breve"} tone={city.available ? "success" : "neutral"} />}
            onPress={city.available ? () => citySheet.current?.dismiss() : undefined}
          />
        ))}
      </SheetModal>
    </View>
  );
}
