import { useEffect } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";
import { useMotionEnabled } from "@/components/core/Motion";

function Ring({ delay, size }: { delay: number; size: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }), -1, false));
  }, [delay, t]);
  const style = useAnimatedStyle(() => ({ opacity: 0.5 * (1 - t.value), transform: [{ scale: 0.25 + t.value * 0.75 }] }));
  return <Animated.View style={[{ position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: "rgba(18,161,80,0.35)", borderWidth: 1.5, borderColor: "rgba(18,161,80,0.6)" }, style]} />;
}

/** Ondas de "radar" à volta da recolha enquanto se procura prestador (ref. 21). */
export function PulseRings({ x, y, size = 200 }: { x: number; y: number; size?: number }) {
  const enabled = useMotionEnabled();
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {enabled ? (
        <>
          <Ring delay={0} size={size} />
          <Ring delay={730} size={size} />
          <Ring delay={1460} size={size} />
        </>
      ) : (
        <View style={{ width: size * 0.6, height: size * 0.6, borderRadius: size, backgroundColor: "rgba(18,161,80,0.18)" }} />
      )}
    </View>
  );
}
