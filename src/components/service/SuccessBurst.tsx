import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Check } from "lucide-react-native";
import { colors } from "@/theme/colors";

/** Visto verde com raios (ref. 26, 30), com entrada animada. */
export function SuccessBurst({ size = 64 }: { size?: number }) {
  const scale = useSharedValue(0.4);
  useEffect(() => {
    scale.value = withSpring(1, { damping: 9 });
  }, [scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size * 1.7, height: size * 1.7, alignItems: "center", justifyContent: "center" }}>
      {rays.map((deg) => (
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
      <View style={{ width: size * 1.25, height: size * 1.25, borderRadius: size, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }}>
        <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }, style]}>
          <Check size={size * 0.55} color={colors.white} strokeWidth={3} />
        </Animated.View>
      </View>
    </View>
  );
}
