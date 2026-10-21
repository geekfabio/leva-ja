import { useEffect, useState } from "react";
import { View } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { AppText, Avatar, BrandLogo, Card, ChoiceChip, ConfirmDialog, DotsIndicator, IconCircle, InfoNote, PrimaryButton, SecondaryButton, ServiceIcon } from "@/components/kit";
import { MapSheetLayout } from "@/components/service/MapSheetLayout";
import { NoActiveRequest } from "@/components/service/NoActiveRequest";
import { serviceTitle } from "@/features/booking/catalog";
import { useActiveClientRequest, useClientSimulation, useStatusRoute } from "@/features/service/useClientSimulation";
import { avatarFor, findProvider } from "@/mocks/people";
import { useServiceStore } from "@/stores/useServiceStore";
import { useAccountStore } from "@/stores/useAccountStore";
import { formatKz, formatRating } from "@/utils/format";
import { swap } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors, radius } from "@/theme/colors";

const reasons = ["Já não preciso", "Demora demasiado", "Enganei-me nos dados", "Outro motivo"];

/** 21 · A procurar prestador (e proposta de preço nas mudanças de casa). */
export default function MatchingScreen() {
  const request = useActiveClientRequest();
  useClientSimulation(request);
  useStatusRoute(request, ["searching"]);
  const autoAdvance = useAccountStore((s) => s.preferences.autoAdvance);
  const [dot, setDot] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [reason, setReason] = useState(reasons[0]!);
  useEffect(() => {
    const t = setInterval(() => setDot((d) => (d + 1) % 3), 600);
    return () => clearInterval(t);
  }, []);
  if (!request) return <NoActiveRequest />;
  const proposal = request.proposal?.status === "sent" ? request.proposal : undefined;
  const proposer = findProvider(request.providerId);

  const cancel = () => {
    useServiceStore.getState().cancel(request.id, reason);
    setConfirm(false);
    toast.info({ title: "Pedido cancelado", message: "Não foi cobrado nenhum valor." });
    swap("/home");
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
      footer={
        proposal ? (
          <>
            <PrimaryButton label="Aceitar proposta" onPress={() => useServiceStore.getState().answerProposal(request.id, true)} trailingIcon={<ArrowRight size={22} color={colors.white} />} />
            <SecondaryButton label="Recusar e procurar outro" onPress={() => useServiceStore.getState().answerProposal(request.id, false)} />
          </>
        ) : (
          <SecondaryButton label="Cancelar pedido" onPress={() => setConfirm(true)} />
        )
      }
    >
      {proposal && proposer ? (
        <>
          <AppText variant="h2" align="center" accessibilityRole="header">
            Recebeste uma proposta
          </AppText>
          <Card style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <Avatar name={proposer.name} initials={proposer.initials} photo={avatarFor[proposer.id]} size={52} verified />
              <View style={{ flex: 1 }}>
                <AppText variant="title">{proposer.name}</AppText>
                <AppText variant="caption" color={colors.muted}>
                  ★ {formatRating(proposer.rating)} · {proposer.vehicle.categoryLabel}
                </AppText>
              </View>
              <AppText variant="h2" color={colors.primary}>
                {formatKz(proposal.amount + request.price.platformFee)}
              </AppText>
            </View>
            <InfoNote>{`“${proposal.reason}”`}</InfoNote>
            <AppText variant="caption" color={colors.muted}>
              Estimativa inicial: {formatKz(request.price.total)}. O total inclui {formatKz(request.price.platformFee)} de taxa de plataforma.
            </AppText>
          </Card>
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
