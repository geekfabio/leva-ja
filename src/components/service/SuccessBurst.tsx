import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { useMotionEnabled } from "@/components/core/Motion";
import { Check } from "lucide-react-native";
import { colors } from "@/theme/colors";

/** Visto verde com raios (ref. 26, 30), com entrada animada. */
export function SuccessBurst({ size = 64 }: { size?: number }) {
  const enabled = useMotionEnabled();
  const scale = useSharedValue(enabled ? 0.4 : 1);
  const rays = useSharedValue(enabled ? 0 : 1);
  useEffect(() => {
    if (!enabled) return;
    scale.value = withSpring(1, { damping: 9 });
    rays.value = withDelay(180, withTiming(1, { duration: 420 }));
  }, [scale, rays, enabled]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const rayStyle = useAnimatedStyle(() => ({ opacity: rays.value, transform: [{ scale: 0.7 + rays.value * 0.3 }] }));
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size * 1.7, height: size * 1.7, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={[{ position: "absolute", width: size * 1.7, height: size * 1.7, alignItems: "center", justifyContent: "center" }, rayStyle]}>
      {angles.map((deg) => (
        <View
          key={deg}
          style={{
            position: "absolute",
            width: 4,
            height: size * 0.18,
            borderRadius: 2,
            backgroundColor: colors.accent,
            transform: [{ rotate: `${deg}deg` }, { translateY: -size * 0.74 }],
          }}
        />
      ))}
      </Animated.View>
      <View style={{ width: size * 1.25, height: size * 1.25, borderRadius: size, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }}>
        <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }, style]}>
          <Check size={size * 0.55} color={colors.white} strokeWidth={3} />
        </Animated.View>
      </View>
    </View>
  );
}
