import { useEffect, useState } from "react";
import { View } from "react-native";
import { AppText, Avatar, BrandLogo, Card, ChoiceChip, ConfirmDialog, DotsIndicator, IconCircle, NegotiationWidget, SecondaryButton, ServiceIcon } from "@/components/kit";
import { MapSheetLayout } from "@/components/service/MapSheetLayout";
import { NoActiveRequest } from "@/components/service/NoActiveRequest";
import { serviceTitle } from "@/features/booking/catalog";
import { useActiveClientRequest, useClientSimulation, useStatusRoute } from "@/features/service/useClientSimulation";
import { useNegotiationActions, useRequestNegotiations } from "@/features/service/useNegotiations";
import { useServiceStore } from "@/stores/useServiceStore";
import { useAccountStore } from "@/stores/useAccountStore";
import { formatRating } from "@/utils/format";
import { swap } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors, radius } from "@/theme/colors";

const reasons = ["Já não preciso", "Demora demasiado", "Enganei-me nos dados", "Outro motivo"];

/** 21 · A procurar prestador: negociações de preço abertas por diferentes prestadores. */
export default function MatchingScreen() {
  const request = useActiveClientRequest();
  useClientSimulation(request);
  useStatusRoute(request, ["searching"]);
  const autoAdvance = useAccountStore((s) => s.preferences.autoAdvance);
  const [dot, setDot] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [reason, setReason] = useState(reasons[0]!);
  const { negotiations, reload: reloadNegotiations } = useRequestNegotiations(request?.id, { active: request?.status === "searching" });
  const actions = useNegotiationActions(request?.id ?? "", reloadNegotiations);
  useEffect(() => {
    const t = setInterval(() => setDot((d) => (d + 1) % 3), 600);
    return () => clearInterval(t);
  }, []);
  if (!request) return <NoActiveRequest />;
  const pending = negotiations.filter((n) => n.status === "pending");

  const cancel = async () => {
    setConfirm(false);
    if (!(await useServiceStore.getState().cancel(request.id, reason))) return toast.error({ title: "Não foi possível cancelar", message: useServiceStore.getState().lastError ?? undefined });
    toast.info({ title: "Pedido cancelado", message: "Não foi cobrado nenhum valor." });
    swap("/home");
  };

  const accept = async (negotiationId: string) => {
    if (!(await actions.accept(negotiationId))) toast.error({ title: "Não foi possível aceitar a negociação" });
  };
  const decline = async (negotiationId: string) => {
    if (!(await actions.decline(negotiationId))) toast.error({ title: "Não foi possível recusar" });
  };

  return (
    <MapSheetLayout
      mapRatio={0.58}
      map={{ pulse: true, markers: [{ id: "o", kind: "origin", coords: request.origin.coords, label: request.origin.area }] }}
      overlay={
        <View style={{ alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.85)", borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 6 }}>
          <BrandLogo size="sm" />
        </View>
      }
      footer={<SecondaryButton label="Cancelar pedido" onPress={() => setConfirm(true)} />}
    >
      {pending.length ? (
        <>
          <AppText variant="h2" align="center" accessibilityRole="header">
            {pending.length === 1 ? "Recebeste uma proposta de preço" : `Recebeste ${pending.length} propostas de preço`}
          </AppText>
          {pending.map((negotiation) => (
            <View key={negotiation.id} style={{ gap: 8 }}>
              {negotiation.provider ? (
                <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                  <Avatar name={negotiation.provider.name} initials={negotiation.provider.initials} photo={negotiation.provider.avatar} size={40} verified />
                  <View style={{ flex: 1 }}>
                    <AppText variant="title">{negotiation.provider.name}</AppText>
                    <AppText variant="caption" color={colors.muted}>
                      ★ {formatRating(negotiation.provider.rating)} · {negotiation.provider.vehicle.categoryLabel}
                    </AppText>
                  </View>
                </View>
              ) : null}
              <NegotiationWidget
                negotiation={negotiation}
                side="client"
                platformFee={request.price.platformFee}
                pending={actions.pendingKey?.endsWith(negotiation.id) ?? false}
                onAdjust={(direction) => actions.adjust(negotiation.id, direction)}
                onAccept={() => accept(negotiation.id)}
                onDecline={() => decline(negotiation.id)}
              />
            </View>
          ))}
        </>
      ) : (
        <>
          <View style={{ gap: 6 }}>
            <AppText variant="h2" align="center" accessibilityRole="header" accessibilityLiveRegion="polite">
              A procurar um prestador
            </AppText>
            <AppText variant="body" align="center" color={colors.text}>
              Estamos a encontrar a melhor viatura perto de ti.
            </AppText>
          </View>
          <Card tone="soft" style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <IconCircle size={64} shape="rounded" tone="white">
              <ServiceIcon kind={request.kind} size={34} color={colors.deep} />
            </IconCircle>
            <View style={{ flex: 1 }}>
              <AppText variant="h3">{serviceTitle[request.kind]}</AppText>
              <AppText variant="body" color={colors.text}>
                {request.origin.area} → {request.destination.area}
              </AppText>
            </View>
          </Card>
          <DotsIndicator count={3} active={dot} />
          {!autoAdvance ? (
            <AppText variant="caption" color={colors.muted} align="center">
              Simulação automática desligada: aceita o pedido na área do prestador.
            </AppText>
          ) : null}
        </>
      )}
      <ConfirmDialog
        visible={confirm}
        title="Cancelar pedido?"
        message="Ainda não foi atribuído nenhum prestador, por isso o cancelamento é gratuito."
        confirmLabel="Cancelar pedido"
        destructive
        onConfirm={cancel}
        onCancel={() => setConfirm(false)}
      >
        <View accessibilityRole="radiogroup" style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {reasons.map((r) => (
            <ChoiceChip key={r} label={r} selected={reason === r} onPress={() => setReason(r)} />
          ))}
        </View>
      </ConfirmDialog>
    </MapSheetLayout>
  );
}
