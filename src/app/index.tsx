import { useEffect } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { StatusBar } from "expo-status-bar";
import { Appear, AppText, TowTruckIcon } from "@/components/kit";
import { useSessionStore } from "@/stores/useSessionStore";
import { swap, homeFor } from "@/features/navigation";
import { colors } from "@/theme/colors";

const DURATION = 1800;

/** Resolve quando a sessão guardada no armazenamento seguro já foi lida. */
const sessionRestored = () =>
  new Promise<void>((resolve) => {
    if (useSessionStore.getState().restored) return resolve();
    const unsubscribe = useSessionStore.subscribe((s) => {
      if (!s.restored) return;
      unsubscribe();
      resolve();
    });
  });

/** 01 · Splash: marca enquanto a sessão guardada é retomada. */
export default function SplashScreen() {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: DURATION, easing: Easing.inOut(Easing.quad) });
    let cancelled = false;
    const minimum = new Promise((resolve) => setTimeout(resolve, DURATION + 150));
    Promise.all([minimum, sessionRestored()]).then(() => {
      if (cancelled) return;
      const { hasOnboarded, authenticated, role } = useSessionStore.getState();
      if (!hasOnboarded) swap("/intro");
      else if (authenticated && role) swap(homeFor(role));
      else swap("/profile-select");
    });
    return () => {
      cancelled = true;
    };
  }, [progress]);
  const bar = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.deeper, alignItems: "center", justifyContent: "center" }}>
      <StatusBar style="light" />
      <Svg style={{ position: "absolute", inset: 0 }} width="100%" height="100%" viewBox="0 0 400 860" preserveAspectRatio="xMidYMid slice">
        <Path d="M420 60 C 250 160, 380 300, 260 420 S 60 640, 120 900" stroke="rgba(255,255,255,0.05)" strokeWidth={70} fill="none" />
        <Path d="M420 60 C 250 160, 380 300, 260 420 S 60 640, 120 900" stroke="rgba(255,255,255,0.08)" strokeWidth={2} strokeDasharray="14 18" fill="none" />
        <Path d="M-20 520 C 80 600, 40 760, 180 900" stroke="rgba(255,255,255,0.04)" strokeWidth={50} fill="none" />
      </Svg>
      <View accessible accessibilityLabel="AngoLeva, reboque, carga e mudanças" style={{ alignItems: "center", gap: 6 }}>
        <Appear from="pop">
          <TowTruckIcon size={104} color={colors.white} strokeWidth={1.8} />
        </Appear>
        <Appear delay={180}>
          <AppText weight="extrabold" color={colors.white} style={{ fontSize: 48, lineHeight: 56, letterSpacing: 1 }}>
            ANGOLEVA
          </AppText>
        </Appear>
        <Appear delay={320} from="fade">
          <AppText variant="h3" weight="regular" color="#D3EFDF">
            Reboque, carga e mudanças
          </AppText>
        </Appear>
      </View>
      <View style={{ position: "absolute", bottom: 72, width: 120, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
        <Animated.View style={[{ height: 4, backgroundColor: colors.accent, borderRadius: 2 }, bar]} />
      </View>
    </View>
  );
}
