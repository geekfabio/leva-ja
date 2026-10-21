import { ReactNode, useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import { useAccountStore } from "@/stores/useAccountStore";
import { formatKz } from "@/utils/format";
import { AppText, type AppTextProps } from "./AppText";

/**
 * Animações desligam-se quando o sistema pede menos movimento ou quando o
 * utilizador activa Definições → Acessibilidade → Reduzir movimento.
 */
export function useMotionEnabled() {
  const system = useReducedMotion();
  const pref = useAccountStore((s) => s.preferences.accessibility.reduceMotion);
  return !system && !pref;
}

/** Durações e molas partilhadas, para o movimento ser consistente em toda a app. */
export const motion = {
  fast: 180,
  base: 320,
  slow: 600,
  stagger: 55,
  spring: { damping: 16, stiffness: 220, mass: 0.8 },
  easeOut: Easing.out(Easing.cubic),
} as const;

const presets = {
  up: FadeInDown,
  down: FadeInUp,
  left: FadeInRight,
  right: FadeInLeft,
  fade: FadeIn,
  pop: ZoomIn,
};

type AppearProps = {
  children: ReactNode;
  /** Posição numa lista: atrasa a entrada para um efeito escalonado. */
  index?: number;
  delay?: number;
  from?: keyof typeof presets;
  style?: StyleProp<ViewStyle>;
};

/** Entrada suave (deslizar e aparecer) de blocos e itens de lista. */
export function Appear({ children, index = 0, delay = 0, from = "up", style }: AppearProps) {
  const enabled = useMotionEnabled();
  const preset = presets[from];
  const base = enabled
    ? preset
        .duration(from === "pop" ? 260 : motion.base)
        .delay(delay + Math.min(index, 8) * motion.stagger)
        .reduceMotion(ReduceMotion.System)
    : undefined;
  // A web só suporta as curvas por omissão dos presets; no nativo usa-se a curva da app.
  const entering = base && Platform.OS !== "web" ? base.easing(motion.easeOut) : base;
  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}

/** Escala ao toque (feedback táctil visual) para cartões e botões. */
export function usePressScale(scaleTo = 0.97) {
  const enabled = useMotionEnabled();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return {
    style,
    onPressIn: () => {
      if (enabled) scale.value = withSpring(scaleTo, motion.spring);
    },
    onPressOut: () => {
      scale.value = withSpring(1, motion.spring);
    },
  };
}

/** Valor que salta ligeiramente quando muda (contadores, totais). */
export function useBump(value: unknown) {
  const enabled = useMotionEnabled();
  const scale = useSharedValue(1);
  useEffect(() => {
    if (!enabled) return;
    scale.value = withTiming(1.12, { duration: 90 }, () => {
      scale.value = withSpring(1, motion.spring);
    });
  }, [value, enabled, scale]);
  return useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
}

/** Contagem progressiva de um número (saldos, ganhos, estimativas). */
export function useCountUp(target: number, duration = 700) {
  const enabled = useMotionEnabled();
  const [value, setValue] = useState(enabled ? 0 : target);
  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    let frame = 0;
    const from = 0;
    const start = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, enabled]);
  return value;
}

const LAYOUT_KEYS = ["flex", "flexGrow", "flexShrink", "flexBasis", "width", "minWidth", "maxWidth", "maxHeight", "alignSelf", "margin", "marginTop", "marginBottom", "marginLeft", "marginRight", "marginHorizontal", "marginVertical"] as const;

type PressState = { pressed: boolean };
type ScalePressableProps = Omit<PressableProps, "style"> & {
  style?: StyleProp<ViewStyle> | ((state: PressState) => StyleProp<ViewStyle>);
  scaleTo?: number;
};

/**
 * Pressable com escala ao toque. O estilo de layout (flex, largura, margens)
 * passa para o invólucro animado para não alterar o posicionamento.
 */
export function ScalePressable({ style, scaleTo = 0.97, onPressIn, onPressOut, ...props }: ScalePressableProps) {
  const press = usePressScale(scaleTo);
  const resolve = (state: PressState) => StyleSheet.flatten(typeof style === "function" ? style(state) : style) ?? {};
  const base = resolve({ pressed: false });
  const outer: ViewStyle = {};
  for (const key of LAYOUT_KEYS) if (base[key] !== undefined) (outer as Record<string, unknown>)[key] = base[key];
  const stretch = outer.flex !== undefined || outer.flexGrow !== undefined || outer.maxHeight !== undefined;
  const inner = (state: PressState) => {
    const s: Record<string, unknown> = { ...resolve(state) };
    for (const key of LAYOUT_KEYS) delete s[key];
    return [s as ViewStyle, stretch ? { flex: 1 } : null];
  };
  return (
    <Animated.View style={[outer, press.style]}>
      <Pressable
        {...props}
        onPressIn={(e) => {
          press.onPressIn();
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          press.onPressOut();
          onPressOut?.(e);
        }}
        style={inner}
      />
    </Animated.View>
  );
}

/** Valor em kwanzas com contagem progressiva até ao total (o leitor de ecrã lê o valor final). */
export function AnimatedAmount({ value, ...props }: Omit<AppTextProps, "children"> & { value: number }) {
  const shown = useCountUp(value);
  return (
    <AppText accessibilityLabel={formatKz(value)} {...props}>
      {formatKz(shown)}
    </AppText>
  );
}
