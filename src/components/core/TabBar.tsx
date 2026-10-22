import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  ZoomIn,
} from "react-native-reanimated";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { AppText } from "./AppText";
import { motion, useMotionEnabled } from "./Motion";

const enabledEntering = () => ZoomIn.duration(220);

/** Fundo do ícone activo e traço inferior, com entrada em mola. */
function ActiveIndicator({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) {
  const enabled = useMotionEnabled();
  const p = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    p.value = enabled
      ? withSpring(focused ? 1 : 0, motion.spring)
      : focused
        ? 1
        : 0;
  }, [focused, enabled, p]);
  const pill = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ scaleX: 0.6 + p.value * 0.4 }],
  }));
  const icon = useAnimatedStyle(() => ({
    transform: [{ translateY: -p.value * 1.5 }, { scale: 1 + p.value * 0.06 }],
  }));
  return (
    <View style={{ paddingHorizontal: 14, paddingVertical: 4 }}>
      <Animated.View
        style={[
          {
            position: "absolute",
            inset: 0,
            borderRadius: 16,
            backgroundColor: colors.primarySoft,
          },
          pill,
        ]}
      />
      <Animated.View style={icon}>{children}</Animated.View>
    </View>
  );
}

/** Barra de separadores das referências: ícone, legenda e traço verde no activo. */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: "row",
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderColor: colors.border,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 6,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]!;
        if ((options as { href?: null }).href === null) return null;
        const focused = state.index === index;
        const color = focused ? colors.primary : colors.muted;
        const label =
          typeof options.title === "string" ? options.title : route.name;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented)
                navigation.navigate(route.name);
            }}
            style={{
              flex: 1,
              alignItems: "center",
              gap: 3,
              minHeight: 52,
              justifyContent: "center",
            }}
          >
            <ActiveIndicator focused={focused}>
              {options.tabBarIcon?.({ focused, color, size: 24 })}
            </ActiveIndicator>
            <AppText
              variant="tiny"
              weight={focused ? "bold" : "medium"}
              color={color}
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{ fontSize: 10.5 }}
            >
              {label}
            </AppText>
            {focused ? (
              <Animated.View
                entering={enabledEntering()}
                style={{
                  position: "absolute",
                  bottom: -6,
                  width: 36,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: colors.primary,
                }}
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
