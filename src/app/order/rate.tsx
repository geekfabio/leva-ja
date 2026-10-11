import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Star } from "lucide-react-native";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { useOrderStore } from "@/stores/useOrderStore";
export default function RateOrderScreen() {
  const { selectedOrder: order, patchOrder } = useOrderStore();
  const [rating, setRating] = useState(order.rating || 5);
  const [note, setNote] = useState(order.review || "");
  return (
    <ScreenLayout
      title="Como foi o serviço?"
      subtitle={order.id}
      action={
        <AppButton
          label="Guardar avaliação"
          disabled={order.status !== "completed"}
          onPress={() => {
            patchOrder(order.id, { rating, review: note });
            router.replace("/(tabs)/orders");
          }}
        />
      }
    >
      <Text className="text-base leading-6 text-muted">
        A tua opinião ajuda a melhorar os transportes, as mudanças e a
        assistência.
      </Text>
      <View accessibilityRole="radiogroup" className="flex-row justify-between">
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable
            accessibilityRole="radio"
            accessibilityLabel={`${value} estrelas`}
            accessibilityState={{ checked: rating === value }}
            key={value}
            onPress={() => setRating(value)}
            className="h-12 w-12 items-center justify-center"
          >
            <Star
              size={32}
              color="#087F4F"
              fill={rating >= value ? "#34D186" : "transparent"}
            />
          </Pressable>
        ))}
      </View>
      <AppInput
        label="Comentário (opcional)"
        value={note}
        onChangeText={setNote}
        multiline
        placeholder="Conta-nos o que correu bem ou pode melhorar."
      />
      {order.status !== "completed" ? (
        <Text className="text-sm text-muted">
          Podes avaliar quando o serviço estiver concluído.
        </Text>
      ) : null}
    </ScreenLayout>
  );
}
