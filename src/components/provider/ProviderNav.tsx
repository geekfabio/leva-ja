import { Pressable, Text, View } from "react-native";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Banknote, Home, ClipboardList, UserRound } from "lucide-react-native";
const items = [
  { path: "/provider", label: "Início", icon: Home },
  { path: "/provider/requests", label: "Pedidos", icon: ClipboardList },
  { path: "/provider/earnings", label: "Ganhos", icon: Banknote },
  { path: "/provider/profile", label: "Perfil", icon: UserRound },
];
export function ProviderNav() {
  const path = usePathname();
  const insets = useSafeAreaInsets();
  if (!items.some((item) => item.path === path)) return null;
  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      className="flex-row border-t border-line bg-white px-2 pt-2 dark:border-slate-800 dark:bg-slate-900"
    >
      {items.map(({ path: target, label, icon: Icon }) => {
        const active = path === target;
        return (
          <Pressable
            key={target}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={label}
            onPress={() => router.replace(target as never)}
            className="min-h-14 flex-1 items-center justify-center gap-1"
          >
            <View
              className={`rounded-full px-5 py-1 ${active ? "bg-brand-soft" : ""}`}
            >
              <Icon size={22} color={active ? "#087F4F" : "#64746C"} />
            </View>
            <Text
              className={`text-xs font-semibold ${active ? "text-brand" : "text-muted"}`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
