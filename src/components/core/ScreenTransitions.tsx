import { ReactElement } from "react";
import { Platform } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInRight, ReduceMotion } from "react-native-reanimated";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { colors } from "@/theme/colors";
import { useMotionEnabled } from "./Motion";

/**
 * Transições entre ecrãs, num só sítio:
 * - push: avança no fluxo (desliza da direita, com gesto de voltar);
 * - fade: troca de estado ou de área (esbate, ex.: splash → onboarding, acompanhamento);
 * - modal: folhas e ecrãs sobrepostos (sobe do fundo).
 * Com «reduzir movimento» activo, as trocas passam a ser instantâneas.
 */
export type TransitionKind = "push" | "fade" | "modal";

const nativeAnimation: Record<TransitionKind, NativeStackNavigationOptions["animation"]> = {
  push: Platform.OS === "android" ? "ios_from_right" : "slide_from_right",
  fade: "fade",
  modal: "slide_from_bottom",
};

const DURATION = 320;

export function useStackOptions(kind: TransitionKind = "push"): NativeStackNavigationOptions {
  const enabled = useMotionEnabled();
  return {
    headerShown: false,
    animation: enabled ? nativeAnimation[kind] : "none",
    animationDuration: DURATION,
    gestureEnabled: true,
    fullScreenGestureEnabled: true,
    animationMatchesGesture: true,
    contentStyle: { backgroundColor: colors.background },
  };
}

/** Opções por ecrã para casos pontuais dentro de uma pilha (ex.: modal numa pilha de push). */
export function useScreenTransition(kind: TransitionKind): Pick<NativeStackNavigationOptions, "animation"> {
  const enabled = useMotionEnabled();
  return { animation: enabled ? nativeAnimation[kind] : "none" };
}

/** Separadores: o conteúdo desliza ligeiramente e esbate ao mudar de separador. */
export function useTabOptions(): BottomTabNavigationOptions {
  const enabled = useMotionEnabled();
  return { headerShown: false, animation: enabled ? "shift" : "none", sceneStyle: { backgroundColor: colors.background } };
}

// Na web a pilha nativa não anima: cada ecrã novo entra com uma animação equivalente.
// Só presets do Reanimated: keyframes e curvas personalizadas não são suportados na web
// e falham quando o ecrã é substituído logo ao abrir (ex.: <Redirect>).
const webEntering = {
  push: FadeInRight.duration(DURATION).reduceMotion(ReduceMotion.System),
  fade: FadeIn.duration(DURATION).reduceMotion(ReduceMotion.System),
  modal: FadeInDown.duration(DURATION).reduceMotion(ReduceMotion.System),
};

function WebScreen({ kind, children }: { kind: TransitionKind; children: ReactElement }) {
  const enabled = useMotionEnabled();
  return (
    <Animated.View entering={enabled ? webEntering[kind] : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      {children}
    </Animated.View>
  );
}

/**
 * `screenLayout` para Stack/Tabs: na web envolve cada ecrã numa entrada animada;
 * no Android e iOS devolve o ecrã tal como está (a transição é nativa).
 */
export function webScreenLayout(kind: TransitionKind | ((route: string) => TransitionKind) = "push") {
  if (Platform.OS !== "web") return undefined;
  function ScreenLayout({ children, route }: { children: ReactElement; route: { name: string } }) {
    return <WebScreen kind={typeof kind === "function" ? kind(route.name) : kind}>{children}</WebScreen>;
  }
  return ScreenLayout;
}
