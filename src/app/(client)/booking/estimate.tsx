import { useMemo, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ArrowRight, Banknote, Info, Package, Tag, UserRound } from "lucide-react-native";
import { AppHeader, AppText, BrandLogo, Card, Divider, EmptyState, InfoNote, MapPreview, PriceSummary, PrimaryButton, RouteSummary, ScreenContainer, SecondaryButton, SheetModal, TextButton, TextField, VehicleImage, AnimatedAmount } from "@/components/kit";
import { bookingSteps, serviceTitle } from "@/features/booking/catalog";
import { estimatePrice, payable, recommendVehicle } from "@/features/booking/pricing";
import { draftIssues } from "@/features/booking/validation";
import { repositories } from "@/data";
import { useBookingStore } from "@/stores/useBookingStore";
import { useServiceStore } from "@/stores/useServiceStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { formatKz } from "@/utils/format";
import { swap } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/colors";
import type { PromoPreview } from "@/types/domain";

/** 20 · Estimativa e confirmação do pedido. */
export default function EstimateStep() {
  const draft = useBookingStore((s) => s.draft);
  const clientId = useSessionStore((s) => s.user.id);
  const detail = useRef<BottomSheetModal>(null);
  const issues = useMemo(() => draftIssues(draft), [draft]);
  const distanceKm = draft.origin && draft.destination ? repositories().locations.distanceKm(draft.origin, draft.destination) : 0;
  const input = { kind: draft.kind, distanceKm, tow: draft.tow, cargo: draft.cargo, moving: draft.moving };
  const estimate = estimatePrice(input);
  const vehicle = recommendVehicle(input);
  const [code, setCode] = useState(draft.promoCode ?? "");
  const [promo, setPromo] = useState<PromoPreview | null>(null);
  const price = promo ? { ...estimate, discount: Math.min(promo.discount, estimate.total), discountLabel: promo.label } : estimate;

  const applyPromo = useMutation({
    mutationFn: () => repositories().discounts.validatePromo({ code: code.trim(), kind: draft.kind, origin: draft.origin!.coords, total: estimate.total }),
    onSuccess: (preview) => {
      setPromo(preview);
      useBookingStore.getState().patch({ promoCode: preview.code });
    },
  });
  const removePromo = () => {
    setPromo(null);
    setCode("");
    applyPromo.reset();
    useBookingStore.getState().patch({ promoCode: undefined });
  };

  const confirm = useMutation({
    mutationFn: async () => {
      const id = await useServiceStore.getState().createFromDraft(draft, clientId);
      if (!id) throw new Error(useServiceStore.getState().lastError ?? "Pedido incompleto");
      return id;
    },
    onSuccess: () => swap("/trip/matching"),
    onError: (error) => toast.error({ title: "Não foi possível criar o pedido", message: error instanceof Error && error.message ? error.message : "Revê os dados e tenta novamente." }),
  });

  if (issues.length || !draft.origin || !draft.destination)
    return (
      <ScreenContainer header={<AppHeader title="O teu pedido" />}>
        <EmptyState
          title="Faltam dados no pedido"
          description={issues[0] ?? "Indica a recolha e o destino."}
          actionLabel={!draft.origin || !draft.destination ? "Escolher trajecto" : "Rever pedido"}
          onAction={() => swap(!draft.origin || !draft.destination ? "/booking/route" : `/booking/${bookingSteps[draft.kind][0]}`)}
        />
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
      <Pressable accessibilityRole="button" accessibilityLabel={`Estimativa ${formatKz(payable(price))}. Ver detalhe do valor`} onPress={() => detail.current?.present()}>
        <Card tone="soft" style={{ gap: 4 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <AppText variant="title">Estimativa</AppText>
            <Info size={20} color={colors.ink} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <AnimatedAmount value={payable(price)} weight="extrabold" color={colors.primary} style={{ fontSize: 40, lineHeight: 48, letterSpacing: -1, flex: 1 }} />
            <AppText variant="tiny" color={colors.muted} style={{ maxWidth: 130 }}>
              Valor indicativo: podes negociar com o prestador antes de confirmares.
            </AppText>
          </View>
        </Card>
      </Pressable>
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Tag size={20} color={colors.primary} />
          <AppText variant="title">Código promocional</AppText>
        </View>
        {promo ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <AppText variant="label" weight="bold" color={colors.primary}>
                {promo.code} aplicado
              </AppText>
              <AppText variant="caption" color={colors.muted}>
                Poupas {formatKz(promo.discount)} neste pedido.
              </AppText>
            </View>
            <TextButton label="Remover" onPress={removePromo} />
          </View>
        ) : (
          <>
            <TextField
              placeholder="Ex.: LUANDA10"
              accessibilityLabel="Código promocional"
              autoCapitalize="characters"
              value={code}
              onChangeText={(text) => {
                setCode(text);
                if (applyPromo.isError) applyPromo.reset();
              }}
              error={applyPromo.isError ? (applyPromo.error instanceof Error ? applyPromo.error.message : "Código inválido.") : undefined}
            />
            <SecondaryButton size="md" label="Aplicar código" loading={applyPromo.isPending} disabled={!code.trim()} onPress={() => applyPromo.mutate()} />
          </>
        )}
      </Card>
      <InfoNote tone="muted" icon={<Banknote size={28} color={colors.primary} />} title="Pagamento em numerário">
        Pagas em dinheiro, directamente ao prestador, quando o serviço terminar.
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
