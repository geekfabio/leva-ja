import { useMemo, useRef } from "react";
import { Pressable, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ArrowRight, Info, Package, ShieldCheck, UserRound } from "lucide-react-native";
import { AppHeader, AppText, BrandLogo, Card, Divider, ErrorState, InfoNote, MapPreview, PriceSummary, PrimaryButton, RouteSummary, ScreenContainer, SheetModal, VehicleImage, AnimatedAmount } from "@/components/kit";
import { serviceTitle } from "@/features/booking/catalog";
import { estimatePrice, needsProposal, recommendVehicle } from "@/features/booking/pricing";
import { draftIssues } from "@/features/booking/validation";
import { roadDistanceKm } from "@/mocks/places";
import { useBookingStore } from "@/stores/useBookingStore";
import { useServiceStore } from "@/stores/useServiceStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { formatKz } from "@/utils/format";
import { swap } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/colors";

/** 20 · Estimativa e confirmação do pedido. */
export default function EstimateStep() {
  const draft = useBookingStore((s) => s.draft);
  const clientId = useSessionStore((s) => s.user.id);
  const detail = useRef<BottomSheetModal>(null);
  const issues = useMemo(() => draftIssues(draft), [draft]);
  const distanceKm = draft.origin && draft.destination ? roadDistanceKm(draft.origin, draft.destination) : 0;
  const input = { kind: draft.kind, distanceKm, tow: draft.tow, cargo: draft.cargo, moving: draft.moving };
  const price = estimatePrice(input);
  const vehicle = recommendVehicle(input);
  const proposal = needsProposal(draft.kind);

  const confirm = useMutation({
    mutationFn: async () => {
      await new Promise((r) => setTimeout(r, 900));
      const id = useServiceStore.getState().createFromDraft(draft, clientId);
      if (!id) throw new Error("Pedido incompleto");
      return id;
    },
    onSuccess: () => swap("/trip/matching"),
    onError: () => toast.error({ title: "Não foi possível criar o pedido", message: "Revê os dados e tenta novamente." }),
  });

  if (issues.length || !draft.origin || !draft.destination)
    return (
      <ScreenContainer header={<AppHeader title="O teu pedido" />}>
        <ErrorState title="Faltam dados no pedido" description={issues[0] ?? "Indica a recolha e o destino."} />
      </ScreenContainer>
    );

  return (
    <ScreenContainer
      header={<AppHeader right={<BrandLogo size="sm" tagline={false} />} />}
      footer={<PrimaryButton label="Confirmar pedido" loading={confirm.isPending} onPress={() => confirm.mutate()} trailingIcon={<ArrowRight size={22} color={colors.white} />} />}
      gap={14}
    >
      <View>
        <AppText variant="h1" accessibilityRole="header">
          O teu pedido
        </AppText>
        <AppText variant="body" style={{ fontSize: 17 }}>
          {draft.variant === "goods" ? "Entrega de mercadoria" : serviceTitle[draft.kind]}
        </AppText>
      </View>
      <Card padding={0} style={{ overflow: "hidden" }}>
        <MapPreview
          height={170}
          static
          route={{ from: draft.origin.coords, to: draft.destination.coords }}
          markers={[
            { id: "o", kind: "origin", coords: draft.origin.coords, label: draft.origin.area },
            { id: "d", kind: "destination", coords: draft.destination.coords, label: draft.destination.area },
          ]}
        />
        <View style={{ padding: 14 }}>
          <RouteSummary origin={draft.origin} destination={draft.destination} distanceKm={distanceKm} />
        </View>
      </Card>
      <Card style={{ gap: 6 }}>
        <AppText variant="title">Viatura recomendada</AppText>
        <View style={{ alignItems: "center" }}>
          <VehicleImage art={vehicle.art} width={230} height={140} label={vehicle.title} />
        </View>
        <AppText variant="h3">{vehicle.title}</AppText>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
          <View style={{ flexDirection: "row", gap: 8, flex: 1 }}>
            <UserRound size={22} color={colors.ink} />
            <AppText variant="caption">{vehicle.crew}</AppText>
          </View>
          <Divider vertical />
          <View style={{ flexDirection: "row", gap: 8, flex: 1.4 }}>
            <Package size={22} color={colors.ink} />
            <AppText variant="caption">{vehicle.suitability}</AppText>
          </View>
        </View>
      </Card>
      <Pressable accessibilityRole="button" accessibilityLabel={`Estimativa ${formatKz(price.total)}. Ver detalhe do valor`} onPress={() => detail.current?.present()}>
        <Card tone="soft" style={{ gap: 4 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <AppText variant="title">Estimativa</AppText>
            <Info size={20} color={colors.ink} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <AnimatedAmount value={price.total} weight="extrabold" color={colors.primary} style={{ fontSize: 40, lineHeight: 48, letterSpacing: -1, flex: 1 }} />
            <AppText variant="tiny" color={colors.muted} style={{ maxWidth: 130 }}>
              {proposal ? "Valor indicativo: o prestador envia a proposta final." : "O valor pode variar ligeiramente conforme o local de carga."}
            </AppText>
          </View>
        </Card>
      </Pressable>
      <InfoNote tone="muted" icon={<ShieldCheck size={28} color={colors.primary} fill={colors.primarySoft} />} title="Pagamento após confirmação">
        Só pagas depois de confirmarmos o motorista e os detalhes do serviço.
      </InfoNote>
      <SheetModal ref={detail} title="Detalhe da estimativa">
        <PriceSummary price={price} detailed totalLabel="Total estimado" />
        <AppText variant="caption" color={colors.muted}>
          Calculado com {distanceKm} km de trajecto, o tipo de serviço e os extras escolhidos. Valores simulados.
        </AppText>
      </SheetModal>
    </ScreenContainer>
  );
}
