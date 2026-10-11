import { getService } from "@/domain/catalog";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { MapPin } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { SelectionCard } from "@/components/ui/SelectionCard";
import { BottomAction } from "@/components/ui/BottomAction";
import { useRequestDraft } from "@/stores/useRequestDraft";
const results = [
  ["Armazém de Viana", "Zona industrial, Viana"],
  ["Casa em Talatona", "Rua 12, Talatona"],
  ["Oficina Auto Centro", "Maianga · 6,4 km"],
  ["Auto Rápido Luanda", "Mutamba · 5,1 km"],
  ["Casa", "Rua da Missão, Ingombota · Favorito"],
];
export default function DestinationScreen() {
  const service = useRequestDraft((state) => state.service);
  const cargo = getService(service).transport;
  const destination = useRequestDraft((state) => state.destination);
  const update = useRequestDraft((state) => state.update);
  const [selected, setSelected] = useState(destination || results[0][0]);
  const [query, setQuery] = useState("");
  const filtered = results.filter(([name, detail]) =>
    `${name} ${detail}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  return (
    <View className="flex-1 bg-surface px-5 dark:bg-slate-950">
      <ScreenHeader
        title={cargo ? "Destino da carga" : "Destino do reboque"}
        subtitle="Escolhe um local de entrega"
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="pb-36"
      >
        <AppInput
          label="Pesquisar destino"
          placeholder="Local ou morada"
          value={query}
          onChangeText={setQuery}
        />
        <Text className="mb-4 mt-6 text-lg font-bold text-ink dark:text-white">
          Locais sugeridos
        </Text>
        <View accessibilityRole="radiogroup" className="gap-3">
          {filtered.map(([name, detail]) => (
            <SelectionCard
              key={name}
              title={name}
              description={detail}
              icon={<MapPin size={22} color="#087F4F" />}
              selected={selected === name}
              onPress={() => setSelected(name)}
            />
          ))}
        </View>
        {!filtered.length ? (
          <Text className="mt-5 text-sm text-muted">
            Não encontrámos esse local. Tenta outra pesquisa.
          </Text>
        ) : null}
        <Text className="mt-5 text-sm text-muted">
          Destino seleccionado: {selected}
        </Text>
      </ScrollView>
      <BottomAction>
        <AppButton
          label="Confirmar destino"
          onPress={() => {
            update({ destination: selected });
            router.back();
          }}
        />
      </BottomAction>
    </View>
  );
}
