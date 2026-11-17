import { useEffect, useRef, useState } from "react";
import { ScrollView, View, type LayoutChangeEvent } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { AppText } from "../core/AppText";
import { motion, ScalePressable, useMotionEnabled } from "../core/Motion";
import { VehicleImage } from "./Media";
import type { VehicleArtKey } from "@/theme/images";
import { colors, radius } from "@/theme/colors";

export type VehiclePickerOption<T extends string> = { value: T; label: string; hint: string; art: VehicleArtKey };

const GAP = 10;
/** Margem interior do cartão que contém o selector: a lista sangra até à borda dele. */
const BLEED = 16;
const MIN_CARD = 124;
const MAX_CARD = 168;

/**
 * Escolha da viatura numa lista horizontal deslizante: os cartões têm sempre um
 * tamanho confortável (também em ecrãs pequenos ou com zoom/letra grande) e o
 * seguinte espreita à direita a mostrar que há mais. O destaque desliza até à
 * viatura seleccionada (por toque ou sugerida pelo peso), a lista centra-a e a
 * viatura "entra" no cartão. Com «reduzir movimento», a troca é instantânea.
 */
export function VehiclePicker<T extends string>({ options, value, onChange }: { options: VehiclePickerOption<T>[]; value: T; onChange: (value: T) => void }) {
  const enabled = useMotionEnabled();
  const scroller = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  // Cerca de 2,6 cartões visíveis: o último "espreita" e convida a deslizar.
  const cardWidth = width ? Math.round(Math.min(MAX_CARD, Math.max(MIN_CARD, width * 0.38))) : MIN_CARD;
  const step = cardWidth + GAP;
  const x = useSharedValue(0);
  const ready = width > 0;
  const viewport = width + BLEED * 2;

  useEffect(() => {
    if (!ready) return;
    const target = index * step;
    x.value = enabled ? withSpring(target, { ...motion.spring, damping: 18 }) : target;
    // Centra a viatura escolhida na lista (sem sair dos limites do conteúdo).
    const contentWidth = BLEED * 2 + options.length * cardWidth + (options.length - 1) * GAP;
    const max = Math.max(0, contentWidth - viewport);
    scroller.current?.scrollTo({ x: Math.min(max, Math.max(0, BLEED + target - (viewport - cardWidth) / 2)), animated: enabled });
  }, [index, step, cardWidth, viewport, options.length, enabled, ready, x]);

  const highlight = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View accessibilityRole="radiogroup" onLayout={onLayout}>
      <ScrollView
        ref={scroller}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={step}
        snapToAlignment="start"
        decelerationRate="fast"
        // Sangra para as margens do cartão pai: os cartões cortam-se na borda dele, não a meio do espaço.
        style={{ marginHorizontal: -BLEED }}
        contentContainerStyle={{ gap: GAP, paddingVertical: 2, paddingHorizontal: BLEED }}
        accessibilityLabel="Viaturas disponíveis, desliza para ver mais"
      >
        {ready ? (
          <Animated.View
            pointerEvents="none"
            style={[
              { position: "absolute", top: 2, bottom: 2, left: BLEED, width: cardWidth, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.accent, backgroundColor: colors.primarySoft },
              highlight,
            ]}
          />
        ) : null}
        {options.map((option) => (
          <VehicleCard key={option.value} option={option} selected={option.value === value} highlightReady={ready} width={cardWidth} onPress={() => onChange(option.value)} />
        ))}
      </ScrollView>
    </View>
  );
}

function VehicleCard<T extends string>({
  option,
  selected,
  highlightReady,
  width,
  onPress,
}: {
  option: VehiclePickerOption<T>;
  selected: boolean;
  highlightReady: boolean;
  width: number;
  onPress: () => void;
}) {
  const enabled = useMotionEnabled();
  const drive = useSharedValue(0);
  const scale = useSharedValue(1);

  // Ao ficar seleccionada, a viatura avança um pouco e assenta (como se chegasse).
  useEffect(() => {
    if (!selected || !enabled) return;
    drive.value = withSequence(withTiming(-16, { duration: 0 }), withSpring(0, { damping: 11, stiffness: 160 }));
    scale.value = withSequence(withTiming(0.88, { duration: 0 }), withSpring(1, { damping: 9, stiffness: 180 }));
  }, [selected, enabled, drive, scale]);

  const art = useAnimatedStyle(() => ({ transform: [{ translateX: drive.value }, { scale: scale.value }] }));
  const imageWidth = width - 28;

  return (
    <ScalePressable
      accessibilityRole="radio"
      accessibilityLabel={`${option.label}. ${option.hint}`}
      accessibilityState={{ checked: selected, selected }}
      aria-checked={selected}
      onPress={onPress}
      style={{
        width,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderRadius: radius.lg,
        borderWidth: 1,
        // O cartão seleccionado é desenhado pelo destaque que desliza por baixo.
        borderColor: selected && highlightReady ? "transparent" : selected ? colors.accent : colors.border,
        backgroundColor: selected ? (highlightReady ? "transparent" : colors.primarySoft) : colors.card,
      }}
    >
      <Animated.View style={art}>
        <VehicleImage art={option.art} width={imageWidth} height={imageWidth * 0.62} label="" />
      </Animated.View>
      <AppText variant="h3" align="center" color={selected ? colors.primary : colors.ink}>
        {option.label}
      </AppText>
      <AppText variant="caption" color={colors.muted} align="center">
        {option.hint}
      </AppText>
    </ScalePressable>
  );
}
