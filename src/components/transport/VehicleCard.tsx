import { Pressable, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { VehicleId, vehicles } from "@/domain/catalog";
import { VehicleArt } from "./VehicleArt";
export function VehicleCard({
  vehicle,
  selected,
  onPress,
}: {
  vehicle: VehicleId;
  selected: boolean;
  onPress: () => void;
}) {
  const item = vehicles[vehicle];
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={item.name}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      className={`overflow-hidden rounded-3xl border-2 ${selected ? "border-brand bg-brand-soft dark:bg-green-950" : "border-line bg-white dark:border-slate-800 dark:bg-slate-900"}`}
    >
      <View className="flex-row items-center px-2 py-3">
        <VehicleArt vehicle={vehicle} size={120} />
        <View className="flex-1 py-3 pr-4">
          <View className="flex-row items-start gap-2">
            <Text className="flex-1 text-lg font-bold text-ink dark:text-white">
              {item.name}
            </Text>
            <View
              className={`h-6 w-6 items-center justify-center rounded-full border ${selected ? "border-brand bg-brand" : "border-slate-300"}`}
            >
              {selected ? <Check size={15} color="white" /> : null}
            </View>
          </View>
          <Text className="mt-2 text-sm leading-5 text-muted">
            {item.description}
          </Text>
          <Text className="mt-2 text-xs leading-5 text-muted">{item.hint}</Text>
        </View>
      </View>
    </Pressable>
  );
}
