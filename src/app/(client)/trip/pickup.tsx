import { useState } from "react";
import { Pressable, View } from "react-native";
import { ArrowRight, Check, CheckCircle2, Circle, ShieldCheck } from "lucide-react-native";
import { AppHeader, AppText, Card, Divider, PhotoCount, PhotoTile, PrimaryButton, ScreenContainer, ScreenTitle } from "@/components/kit";
import { NoActiveRequest } from "@/components/service/NoActiveRequest";
import { useActiveClientRequest, useStatusRoute } from "@/features/service/useClientSimulation";
import { useServiceStore } from "@/stores/useServiceStore";
import { swap } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors, radius } from "@/theme/colors";

function MiniSteps({ current }: { current: number }) {
  const steps = ["Detalhes", "Recolha", "Entrega"];
  return (
    <View accessible accessibilityLabel={`Etapa ${current + 1} de 3: ${steps[current]}`} style={{ flexDirection: "row", alignItems: "flex-start" }}>
      {steps.map((s, i) => (
        <View key={s} style={{ alignItems: "center", width: 62 }}>
          <View style={{ flexDirection: "row", alignItems: "center", height: 26 }}>
            <View style={{ width: 20, height: 3, backgroundColor: i === 0 ? "transparent" : i <= current ? colors.accent : colors.border }} />
            {i <= current ? <CheckCircle2 size={24} color={colors.white} fill={colors.accent} /> : <Circle size={22} color={colors.borderStrong} fill={colors.border} />}
            <View style={{ width: 20, height: 3, backgroundColor: i === steps.length - 1 ? "transparent" : i < current ? colors.accent : colors.border }} />
          </View>
          <AppText variant="tiny" color={i <= current ? colors.text : colors.muted}>
            {s}
          </AppText>
        </View>
      ))}
    </View>
  );
}

/** 27 · Confirmar a recolha: fotos do prestador e verificação da carga. */
export default function PickupScreen() {
  const request = useActiveClientRequest();
  useStatusRoute(request, ["arrived"]);
  const tow = request?.kind === "tow";
  const checklist = tow
    ? ["Viatura carregada na plataforma", "Fixação verificada", "Chaves e documentos entregues"]
    : ["Carga verificada", "Embalagem segura", ...(request?.cargo?.helper || (request?.moving?.helpers ?? 0) > 0 ? ["Ajudante presente"] : ["Carga presa e estável"])];
  const [checked, setChecked] = useState<boolean[]>(() => checklist.map(() => true));
  if (!request) return <NoActiveRequest />;
  // Fotos registadas pelo prestador na recolha; senão as que o cliente enviou no pedido.
  const photos = request.pickupPhotos.length ? request.pickupPhotos : request.photos;
  const all = checked.every(Boolean);
  const confirm = async () => {
    const store = useServiceStore.getState();
    if (!request.pickupPhotos.length) await store.addPickupPhotos(request.id, photos);
    if (await store.transition(request.id, "pickup_confirmed", "client")) {
      toast.success({ title: "Recolha confirmada", message: "O transporte vai começar." });
      swap("/trip/in-transit");
    } else toast.error({ title: "Não foi possível confirmar", message: useServiceStore.getState().lastError ?? undefined });
  };
  return (
    <ScreenContainer header={<AppHeader right={<MiniSteps current={1} />} />} footer={<PrimaryButton label="Confirmar recolha" disabled={!all} onPress={confirm} trailingIcon={<ArrowRight size={22} color={colors.white} />} accessibilityHint={all ? undefined : "Marca todos os pontos da verificação"} />} gap={14}>
      <ScreenTitle title="Confirma a recolha" subtitle={tow ? "Revê as fotos e confirma que a viatura foi carregada." : "Revê as fotos e confirma que a carga foi recolhida."} />
      <PhotoTile photo={photos[0]!} size="flex" aspect={1.45} rounded={radius.lg} />
      <View style={{ flexDirection: "row", gap: 8 }}>
        {photos.slice(1, 4).map((p) => (
          <PhotoTile key={p.id} photo={p} size="flex" aspect={1.25} />
        ))}
      </View>
      <PhotoCount count={photos.length} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: 16 }}>
        <ShieldCheck size={28} color={colors.white} fill={colors.accent} />
        <AppText variant="title">{tow ? "Viatura protegida" : "Carga protegida"}</AppText>
      </View>
      <Card padding={0}>
        {checklist.map((item, i) => (
          <View key={item}>
            {i ? <Divider inset={56} /> : null}
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: checked[i] }}
              accessibilityLabel={item}
              onPress={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, padding: 16, minHeight: 56, backgroundColor: pressed ? colors.primarySoft : "transparent" })}
            >
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: checked[i] ? colors.accent : colors.card, borderWidth: checked[i] ? 0 : 2, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center" }}>
                {checked[i] ? <Check size={16} color={colors.white} strokeWidth={3} /> : null}
              </View>
              <AppText variant="title" weight="semibold" style={{ flex: 1 }}>
                {item}
              </AppText>
            </Pressable>
          </View>
        ))}
      </Card>
    </ScreenContainer>
  );
}
