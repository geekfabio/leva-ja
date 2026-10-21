import { useRef, useState } from "react";
import { View } from "react-native";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BriefcaseBusiness, House, MapPin, Plus, Trash2 } from "lucide-react-native";
import { AppHeader, AppText, ChoiceChip, ConfirmDialog, EmptyState, IconButton, ListRow, PrimaryButton, ScreenContainer, SheetModal, TextField } from "@/components/kit";
import { AddressPicker } from "@/components/service/AddressPicker";
import { useAccountStore } from "@/stores/useAccountStore";
import type { Place, SavedAddress } from "@/types/domain";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/colors";

const icons = { home: House, work: BriefcaseBusiness, pin: MapPin };

/** Endereços guardados do cliente. */
export default function AddressesScreen() {
  const addresses = useAccountStore((s) => s.addresses);
  const picker = useRef<BottomSheetModal>(null);
  const labelSheet = useRef<BottomSheetModal>(null);
  const [place, setPlace] = useState<Place>();
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState<SavedAddress["icon"]>("pin");
  const [remove, setRemove] = useState<SavedAddress>();
  const save = async () => {
    if (!place || label.trim().length < 2) return;
    if (!(await useAccountStore.getState().addAddress({ label: label.trim(), place, icon }))) return toast.error("Não foi possível guardar o endereço");
    labelSheet.current?.dismiss();
    setLabel("");
    toast.success("Endereço guardado");
  };
  return (
    <ScreenContainer header={<AppHeader title="Endereços guardados" />} footer={<PrimaryButton label="Adicionar endereço" icon={<Plus size={22} color={colors.white} />} onPress={() => picker.current?.present()} />} gap={10}>
      {addresses.length ? (
        addresses.map((a) => {
          const Icon = icons[a.icon];
          return (
            <ListRow
              key={a.id}
              icon={<Icon size={24} color={colors.primary} />}
              title={a.label}
              subtitle={a.place.label}
              right={<IconButton label={`Apagar ${a.label}`} icon={<Trash2 size={20} color={colors.danger} />} onPress={() => setRemove(a)} />}
            />
          );
        })
      ) : (
        <EmptyState icon={<MapPin size={32} color={colors.primary} />} title="Sem endereços guardados" description="Guarda a casa ou o trabalho para pedir mais depressa." />
      )}
      <AddressPicker
        ref={picker}
        title="Escolher morada"
        showCurrent
        onPick={(p) => {
          setPlace(p);
          picker.current?.dismiss();
          setTimeout(() => labelSheet.current?.present(), 250);
        }}
      />
      <SheetModal ref={labelSheet} title="Nome do endereço">
        <AppText variant="body" color={colors.muted}>
          {place?.label}
        </AppText>
        <TextField label="Nome" placeholder="Ex.: Casa da avó" value={label} onChangeText={setLabel} error={label && label.trim().length < 2 ? "Indica um nome." : undefined} />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <ChoiceChip label="Casa" selected={icon === "home"} onPress={() => setIcon("home")} />
          <ChoiceChip label="Trabalho" selected={icon === "work"} onPress={() => setIcon("work")} />
          <ChoiceChip label="Outro" selected={icon === "pin"} onPress={() => setIcon("pin")} />
        </View>
        <PrimaryButton label="Guardar endereço" disabled={label.trim().length < 2} onPress={save} />
      </SheetModal>
      <ConfirmDialog
        visible={!!remove}
        title="Apagar endereço?"
        message={`“${remove?.label}” deixa de aparecer nas sugestões.`}
        confirmLabel="Apagar"
        destructive
        onCancel={() => setRemove(undefined)}
        onConfirm={() => {
          useAccountStore.getState().removeAddress(remove!.id);
          setRemove(undefined);
        }}
      />
    </ScreenContainer>
  );
}
