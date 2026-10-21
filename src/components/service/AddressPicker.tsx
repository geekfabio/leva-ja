import { forwardRef, useState } from "react";
import { View } from "react-native";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BriefcaseBusiness, House, LocateFixed, MapPin, Search } from "lucide-react-native";
import type { Place } from "@/types/domain";
import { userLocation } from "@/mocks/places";
import { usePlaceSearch } from "@/services/queries";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import { ListRow } from "@/components/core/ListRow";
import { SheetModal } from "@/components/core/SheetModal";
import { TextField } from "@/components/core/TextField";
import { EmptyState, ErrorState, LoadingState } from "@/components/core/States";

const savedIcon = { home: House, work: BriefcaseBusiness, pin: MapPin };

/** Pesquisa de moradas numa folha inferior: posição actual, endereços guardados e resultados mock. */
export const AddressPicker = forwardRef<BottomSheetModal, { title: string; onPick: (place: Place) => void; showCurrent?: boolean }>(function AddressPicker(
  { title, onPick, showCurrent = true },
  ref,
) {
  const [query, setQuery] = useState("");
  const { data, isLoading, isError, refetch } = usePlaceSearch(query);
  const pick = (place: Place) => {
    onPick(place);
    setQuery("");
  };
  return (
    <SheetModal ref={ref} title={title} snapPoints={["85%"]}>
      <TextField placeholder="Pesquisar bairro ou rua" accessibilityLabel="Pesquisar morada" icon={<Search size={20} color={colors.muted} />} value={query} onChangeText={setQuery} autoCorrect={false} />
      {showCurrent && !query ? (
        <ListRow variant="plain" icon={<LocateFixed size={22} color={colors.primary} />} title="Usar a minha localização" subtitle={`${userLocation.label} (simulada)`} onPress={() => pick(userLocation)} chevron={false} />
      ) : null}
      {isLoading ? <LoadingState rows={3} label="A procurar moradas" /> : null}
      {isError ? <ErrorState onRetry={refetch} /> : null}
      {data?.saved.length ? (
        <View>
          <AppText variant="label" color={colors.muted} style={{ marginBottom: 4 }}>
            Endereços guardados
          </AppText>
          {data.saved.map((a) => {
            const Icon = savedIcon[a.icon];
            return <ListRow key={a.id} variant="plain" icon={<Icon size={22} color={colors.ink} />} title={a.label} subtitle={a.place.label} onPress={() => pick(a.place)} chevron={false} />;
          })}
        </View>
      ) : null}
      {data ? (
        <View>
          <AppText variant="label" color={colors.muted} style={{ marginBottom: 4 }}>
            {query ? "Resultados" : "Sugestões em Luanda"}
          </AppText>
          {data.results.length ? (
            data.results.map((p) => <ListRow key={p.id} variant="plain" icon={<MapPin size={22} color={colors.ink} />} title={p.label} subtitle={p.area === p.label.split(",")[0] ? p.city : `${p.area}, ${p.city}`} onPress={() => pick(p)} chevron={false} />)
          ) : (
            <EmptyState title="Sem resultados" description="Experimenta outro bairro, por exemplo Talatona ou Maianga." />
          )}
        </View>
      ) : null}
    </SheetModal>
  );
});
