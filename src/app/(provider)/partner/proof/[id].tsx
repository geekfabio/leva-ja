import { useEffect, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, CircleCheck, MapPin } from "lucide-react-native";
import { AppHeader, AppText, Card, DeliveryProofForm, Divider, EmptyState, IconCircle, PrimaryButton, ScreenContainer, ServiceIcon, TextField, VehicleImage } from "@/components/kit";
import { Avatar } from "@/components/core/Avatar";
import { serviceTitle } from "@/features/booking/catalog";
import { proofSchema } from "@/features/provider/schemas";
import { repositories } from "@/data";
import { useRequest, useServiceStore } from "@/stores/useServiceStore";
import type { Photo } from "@/types/domain";
import { formatKz } from "@/utils/format";
import { swap } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/colors";
import { clientOf } from "@/features/service/people";
import { useMyProvider } from "@/features/provider/useProvider";

/** 46 · Comprovativo de entrega: fotos, assinatura do cliente e condição da carga. */
export default function DeliveryProofScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const request = useRequest(id);
  const me = useMyProvider();
  const vehicle = me.vehicle;
  const [photos, setPhotos] = useState<Photo[]>([]);
  // Três fotos iniciais "tiradas" pela câmara (MediaRepository).
  useEffect(() => {
    Promise.all([0, 1, 2].map((i) => repositories().media.capture("delivery", i))).then(setPhotos).catch(() => undefined);
  }, []);
  const [signed, setSigned] = useState(false);
  const [good, setGood] = useState(true);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = useMutation({
    mutationFn: async () => {
      const client = clientOf(request);
      if (!(await useServiceStore.getState().submitProof(request!.id, { photos, signedBy: client.name, goodCondition: good, notes: notes.trim() || undefined }))) throw new Error(useServiceStore.getState().lastError ?? "Estado inválido");
    },
    onSuccess: () => {
      toast.success({ title: "Serviço concluído", message: `${formatKz(request!.providerEarning)} adicionados ao teu saldo.` });
      swap("/partner");
    },
    onError: () => toast.error("Não foi possível concluir o serviço"),
  });
  if (!request || request.status !== "in_transit")
    return (
      <ScreenContainer header={<AppHeader title="Confirmar entrega" />}>
        <EmptyState title="Entrega indisponível" description="O comprovativo só pode ser registado durante o transporte." actionLabel="Voltar ao painel" onAction={() => swap("/partner")} />
      </ScreenContainer>
    );
  const client = clientOf(request);
  const done = () => {
    const result = proofSchema.safeParse({ photos, signed, signedBy: client.name, goodCondition: good, notes });
    if (!result.success) {
      const e: Record<string, string> = {};
      result.error.issues.forEach((i) => (e[String(i.path[0])] ??= i.message));
      return setErrors(e);
    }
    setErrors({});
    submit.mutate();
  };
  const addPhoto = async () => {
    const next = await repositories().media.capture("delivery", photos.length);
    setPhotos((p) => [...p, next]);
  };

  return (
    <ScreenContainer
      header={<AppHeader title="Confirmar entrega" variant="green" />}
      footer={<PrimaryButton label="Concluir serviço" loading={submit.isPending} icon={<CircleCheck size={24} color={colors.white} />} trailingIcon={<ArrowRight size={22} color={colors.white} />} onPress={done} />}
      gap={14}
      contentStyle={{ paddingTop: 16 }}
    >
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <IconCircle size={52} shape="rounded">
            <ServiceIcon kind={request.kind} size={26} color={colors.ink} />
          </IconCircle>
          <View>
            <AppText variant="h3">{serviceTitle[request.kind]}</AppText>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <MapPin size={14} color={colors.ink} />
              <AppText variant="caption">{request.destination.label}</AppText>
            </View>
          </View>
        </View>
        <Divider />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Avatar name={me.name} initials={me.initials} photo={me.avatar} size={48} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <AppText variant="title">{me.name}</AppText>
              <BadgeCheck size={16} color={colors.white} fill={colors.accent} />
            </View>
            <AppText variant="caption" color={colors.muted}>
              Prestador verificado
            </AppText>
          </View>
          <VehicleImage art="pickup" width={74} height={44} />
          <View>
            <AppText variant="tiny" weight="bold">
              {vehicle.brand} {vehicle.model}
            </AppText>
            <AppText variant="tiny" color={colors.muted}>
              {vehicle.plate}
            </AppText>
          </View>
        </View>
      </Card>
      <DeliveryProofForm
        photos={photos}
        onAddPhoto={addPhoto}
        onRemovePhoto={(pid) => setPhotos((p) => p.filter((x) => x.id !== pid))}
        onSigned={setSigned}
        goodCondition={good}
        onConditionChange={setGood}
        photoError={errors.photos}
        signatureError={errors.signed}
      />
      {!good ? <TextField label="O que aconteceu?" multiline placeholder="Descreve danos ou itens em falta" value={notes} onChangeText={setNotes} maxLength={200} counter error={errors.notes} /> : null}
    </ScreenContainer>
  );
}
