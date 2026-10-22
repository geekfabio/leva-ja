import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { Appear } from "@/components/core/Motion";
import { MapPreview, type MapPreviewProps } from "@/components/map/MapPreview";

/**
 * Mapa no topo e folha inferior arredondada com a informação do pedido
 * (ref. 21–23, 26, 28, 34, 36). A folha rola quando o conteúdo é grande.
 */
export function MapSheetLayout({
  map,
  overlay,
  children,
  footer,
  mapRatio = 0.5,
}: {
  map: MapPreviewProps;
  overlay?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  mapRatio?: number;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: mapRatio }}>
        <MapPreview height="100%" {...map} />
        {overlay ? (
          <SafeAreaView edges={["top"]} pointerEvents="box-none" style={{ position: "absolute", left: 16, right: 16, top: 4 }}>
            {overlay}
          </SafeAreaView>
        ) : null}
      </View>
      <View style={{ flex: 1 - mapRatio, marginTop: -28, backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" }}>
        <View style={{ alignSelf: "center", width: 44, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong, marginTop: 10, marginBottom: 4 }} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 14 }} showsVerticalScrollIndicator={false}>
          <Appear style={{ gap: 14 }} delay={80}>
            {children}
          </Appear>
        </ScrollView>
        {footer ? (
          <SafeAreaView edges={["bottom"]} style={{ paddingHorizontal: 20, paddingBottom: 12, paddingTop: 6, gap: 10 }}>
            {footer}
          </SafeAreaView>
        ) : null}
      </View>
    </View>
  );
}
