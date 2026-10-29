import { useEffect, useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { AppText } from "../core/AppText";
import { motion, ScalePressable, useMotionEnabled } from "../core/Motion";
import { VehicleImage } from "./Media";
import type { VehicleArtKey } from "@/theme/images";
import { colors, radius } from "@/theme/colors";

export type VehiclePickerOption<T extends string> = { value: T; label: string; hint: string; art: VehicleArtKey };

const GAP = 8;

/**
 * Escolha da viatura em cartões lado a lado. O destaque desliza até à viatura
 * seleccionada (por toque ou sugerida pelo peso) e a viatura "entra" no cartão.
 * Com «reduzir movimento», a troca é instantânea.
 */
export function VehiclePicker<T extends string>({ options, value, onChange }: { options: VehiclePickerOption<T>[]; value: T; onChange: (value: T) => void }) {
  const enabled = useMotionEnabled();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const cardWidth = width ? (width - GAP * (options.length - 1)) / options.length : 0;
  const x = useSharedValue(0);
  const ready = width > 0;

  useEffect(() => {
    if (!ready) return;
    const target = index * (cardWidth + GAP);
    x.value = enabled ? withSpring(target, { ...motion.spring, damping: 18 }) : target;
  }, [index, cardWidth, enabled, ready, x]);

  const highlight = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (!width) x.value = index * ((w - GAP * (options.length - 1)) / options.length + GAP);
    setWidth(w);
  };

  return (
    <View accessibilityRole="radiogroup" onLayout={onLayout} style={{ flexDirection: "row", gap: GAP }}>
      {ready ? (
        <Animated.View
          pointerEvents="none"
          style={[
            { position: "absolute", top: 0, bottom: 0, left: 0, width: cardWidth, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.accent, backgroundColor: colors.primarySoft },
            highlight,
          ]}
        />
      ) : null}
      {options.map((option) => (
        <VehicleCard key={option.value} option={option} selected={option.value === value} highlightReady={ready} onPress={() => onChange(option.value)} />
      ))}
    </View>
  );
}

function VehicleCard<T extends string>({ option, selected, highlightReady, onPress }: { option: VehiclePickerOption<T>; selected: boolean; highlightReady: boolean; onPress: () => void }) {
  const enabled = useMotionEnabled();
  const drive = useSharedValue(0);
  const scale = useSharedValue(1);

  // Ao ficar seleccionada, a viatura avança um pouco e assenta (como se chegasse).
  useEffect(() => {
    if (!selected || !enabled) return;
    drive.value = withSequence(withTiming(-14, { duration: 0 }), withSpring(0, { damping: 11, stiffness: 160 }));
    scale.value = withSequence(withTiming(0.88, { duration: 0 }), withSpring(1, { damping: 9, stiffness: 180 }));
  }, [selected, enabled, drive, scale]);

  const art = useAnimatedStyle(() => ({ transform: [{ translateX: drive.value }, { scale: scale.value }] }));

  return (
    <ScalePressable
      accessibilityRole="radio"
      accessibilityLabel={`${option.label}. ${option.hint}`}
      accessibilityState={{ checked: selected, selected }} aria-checked={selected}
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 12,
        paddingHorizontal: 6,
        borderRadius: radius.lg,
        borderWidth: 1,
        // O cartão seleccionado é desenhado pelo destaque que desliza por baixo.
        borderColor: selected && highlightReady ? "transparent" : selected ? colors.accent : colors.border,
        backgroundColor: selected && !highlightReady ? colors.primarySoft : "transparent",
      }}
    >
      <Animated.View style={art}>
        <VehicleImage art={option.art} width={84} height={52} label="" />
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
