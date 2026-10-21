import { Pressable, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { AppText } from "./AppText";

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
        const label = typeof options.title === "string" ? options.title : route.name;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={() => {
              const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            style={{ flex: 1, alignItems: "center", gap: 3, minHeight: 52, justifyContent: "center" }}
          >
            <View
              style={{
                paddingHorizontal: 14,
                paddingVertical: 4,
                borderRadius: 16,
                backgroundColor: focused ? colors.primarySoft : "transparent",
              }}
            >
              {options.tabBarIcon?.({ focused, color, size: 24 })}
            </View>
            <AppText variant="tiny" weight={focused ? "bold" : "medium"} color={color} numberOfLines={1} adjustsFontSizeToFit style={{ fontSize: 10.5 }}>
              {label}
            </AppText>
            {focused ? <View style={{ position: "absolute", bottom: -6, width: 36, height: 3, borderRadius: 2, backgroundColor: colors.primary }} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
