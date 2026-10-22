import { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { Path } from "react-native-svg";
import { RotateCcw } from "lucide-react-native";
import { colors, radius } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";

/**
 * Área de assinatura desenhada com o dedo (Gesture Handler + SVG). Guarda apenas
 * os traços em memória; nesta fase a assinatura não é enviada a lado nenhum.
 */
export function SignaturePad({ onChange, height = 150 }: { onChange: (signed: boolean) => void; height?: number }) {
  const [paths, setPaths] = useState<string[]>([]);
  const current = useRef<string>("");

  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    .onBegin((e) => {
      current.current = `M ${e.x.toFixed(1)} ${e.y.toFixed(1)}`;
      setPaths((p) => [...p, current.current]);
    })
    .onUpdate((e) => {
      current.current += ` L ${e.x.toFixed(1)} ${e.y.toFixed(1)}`;
      setPaths((p) => [...p.slice(0, -1), current.current]);
    })
    .onFinalize(() => {
      onChange(true);
    });

  const clear = () => {
    setPaths([]);
    onChange(false);
  };

  return (
    <View
      accessible
      accessibilityLabel={paths.length ? "Assinatura recolhida" : "Área de assinatura. Peça ao cliente para assinar com o dedo."}
      style={{ height, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, overflow: "hidden" }}
    >
      <GestureDetector gesture={pan}>
        <View style={{ flex: 1 }}>
          <Svg width="100%" height="100%">
            {paths.map((d, i) => (
              <Path key={i} d={d} stroke={colors.ink} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
          </Svg>
          {!paths.length ? (
            <View pointerEvents="none" style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
              <AppText variant="caption" color={colors.subtle}>
                Assine aqui
              </AppText>
            </View>
          ) : null}
        </View>
      </GestureDetector>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Limpar assinatura"
        onPress={clear}
        hitSlop={8}
        style={{ position: "absolute", right: 12, bottom: 10, flexDirection: "row", alignItems: "center", gap: 6 }}
      >
        <RotateCcw size={16} color={colors.muted} />
        <AppText variant="caption" color={colors.muted}>
          Limpar
        </AppText>
      </Pressable>
    </View>
  );
}
