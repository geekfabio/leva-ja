import { View } from "react-native";
import { ImageIcon } from "lucide-react-native";
import { AppText, IconCircle, PhotoTile, AddPhotoTile, PrimaryButton, ScreenTitle, TextField } from "@/components/kit";
import { BookingScaffold } from "@/components/service/BookingScaffold";
import { useBookingStep } from "@/features/booking/useBookingFlow";
import { repositories } from "@/data";
import { useBookingStore } from "@/stores/useBookingStore";
import { toast } from "@/lib/toast";
import { colors, radius } from "@/theme/colors";

const MAX = 6;

/** 18 · Fotos da carga/viatura e instruções. Câmara ou galeria (na demonstração, fotos de exemplo). */
export default function PhotosStep() {
  const { position, next, kind } = useBookingStep("photos");
  const photos = useBookingStore((s) => s.draft.photos);
  const instructions = useBookingStore((s) => s.draft.instructions);
  const patch = useBookingStore((s) => s.patch);

  /** Câmara: na fase mock o MediaRepository devolve fotos de exemplo. */
  const addPhoto = async () => {
    if (photos.length >= MAX) return toast.info({ title: "Limite atingido", message: `Podes adicionar até ${MAX} fotos.` });
    try {
      const photo = await repositories().media.capture(kind === "tow" ? "vehicle" : "cargo", photos.length);
      if (!photo) return;
      patch({ photos: [...useBookingStore.getState().draft.photos, photo] });
    } catch {
      toast.error("Não foi possível abrir a câmara");
    }
  };
  const remove = (id: string) => patch({ photos: photos.filter((p) => p.id !== id) });
  const slots = Math.max(0, 3 - photos.length);

  return (
    <BookingScaffold step={position} onContinue={next} continueLabel={photos.length ? "Continuar" : "Continuar sem fotos"}>
      <ScreenTitle title={kind === "tow" ? "Adiciona fotos da viatura" : "Adiciona fotos da carga"} subtitle="As fotos ajudam-nos a enviar a viatura certa." />
      <View style={{ borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.borderStrong, borderRadius: radius.lg, paddingVertical: 28, alignItems: "center", gap: 16 }}>
        <IconCircle size={72} tone="white">
          <ImageIcon size={44} color={colors.primary} strokeWidth={1.6} />
        </IconCircle>
        <PrimaryButton size="md" label="Adicionar fotos" onPress={addPhoto} accessibilityHint="Abre a câmara ou a galeria" />
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {photos.map((photo) => (
          <View key={photo.id} style={{ width: "31%" }}>
            <PhotoTile photo={photo} size="flex" onRemove={() => remove(photo.id)} />
          </View>
        ))}
        {Array.from({ length: slots }, (_, i) => (
          <View key={i} style={{ width: "31%" }}>
            <AddPhotoTile onPress={addPhoto} />
          </View>
        ))}
      </View>
      <AppText variant="h3" style={{ marginTop: 4 }}>
        Instruções para o prestador
      </AppText>
      <TextField multiline placeholder="Ex.: ligar antes de chegar" accessibilityLabel="Instruções para o prestador" value={instructions} onChangeText={(t) => patch({ instructions: t })} maxLength={300} counter />
    </BookingScaffold>
  );
}
