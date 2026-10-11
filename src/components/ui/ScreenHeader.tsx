import { IconButton } from "./IconButton";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";

export function ScreenHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const insets = useSafeAreaInsets();
  const progress = subtitle?.match(/^Passo (\d+) de (\d+)$/);
  return (
    <View style={{ paddingTop: Math.max(insets.top, 16) }} className="mb-6">
      <View className="flex-row items-center gap-3">
        <IconButton
          label="Voltar"
          icon={<ChevronLeft size={22} color="#132A21" />}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/")
          }
        />
        <View className="flex-1">
          <Text
            accessibilityRole="header"
            className="text-xl font-bold tracking-tight text-ink dark:text-white"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-1 text-sm text-muted">{subtitle}</Text>
          ) : null}
        </View>
      </View>
      {progress ? (
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Progresso do pedido"
          accessibilityValue={{
            min: 1,
            max: Number(progress[2]),
            now: Number(progress[1]),
          }}
          className="mt-5 flex-row gap-1.5"
        >
          {Array.from({ length: Number(progress[2]) }, (_, index) => (
            <View
              key={index}
              className={`h-1 flex-1 rounded-full ${index < Number(progress[1]) ? "bg-brand-bright" : "bg-line"}`}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
