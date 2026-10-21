import { useRef, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  ArrowRight,
  Banknote,
  Check,
  CreditCard,
  Landmark,
} from "lucide-react-native";
import {
  AppText,
  Card,
  Divider,
  InfoNote,
  MapPreview,
  PrimaryButton,
  ScreenContainer,
  SelectionCard,
  SheetModal,
  VehicleImage, AnimatedAmount } from "@/components/kit";
import { NoActiveRequest } from "@/components/service/NoActiveRequest";
import { serviceTitle } from "@/features/booking/catalog";
import {
  useActiveClientRequest,
  useStatusRoute,
} from "@/features/service/useClientSimulation";
import { paymentKindCopy } from "@/mocks/account";
import { useAccountStore } from "@/stores/useAccountStore";
import { useServiceStore } from "@/stores/useServiceStore";
import type { PaymentMethodKind } from "@/types/domain";
import { formatTime } from "@/utils/date";
import { formatDuration, formatKz } from "@/utils/format";
import { swap } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors, radius } from "@/theme/colors";

const icons = { bank_reference: Landmark, card: CreditCard, cash: Banknote };
const artFor = {
  tow: "tow",
  cargo: "pickup",
  small_move: "van",
  house_move: "box",
} as const;

/** 29 · Serviço concluído e escolha do pagamento (simulado: nenhum valor é cobrado). */
export default function PaymentScreen() {
  const request = useActiveClientRequest();
  useStatusRoute(request, ["delivered"]);
  const defaultKind = useAccountStore(
    (s) => s.paymentMethods.find((p) => p.isDefault)?.kind ?? "bank_reference",
  );
  const [method, setMethod] = useState<PaymentMethodKind>(defaultKind);
  const reference = useRef<BottomSheetModal>(null);
  const pay = useMutation({
    mutationFn: async () => {
      await new Promise((r) => setTimeout(r, 1500));
      if (!useServiceStore.getState().pay(request!.id, method))
        throw new Error("Estado inválido");
    },
    onSuccess: () => {
      reference.current?.dismiss();
      swap("/trip/receipt");
    },
    onError: () =>
      toast.error({
        title: "Pagamento não concluído",
        message: "Tenta novamente ou escolhe outro método.",
      }),
  });
  if (!request) return <NoActiveRequest />;

  const proceed = () =>
    method === "bank_reference" ? reference.current?.present() : pay.mutate();
  const started =
    request.timeline.find((e) => e.status === "in_transit")?.at ??
    request.createdAt;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenContainer
        edges={[]}
        padded={false}
        gap={12}
        footer={
          <PrimaryButton
            label={
              method === "cash"
                ? "Confirmar pagamento em numerário"
                : "Continuar para pagamento"
            }
            loading={pay.isPending && method !== "bank_reference"}
            onPress={proceed}
            trailingIcon={<ArrowRight size={22} color={colors.white} />}
          />
        }
      >
        <SafeAreaView
          edges={["top"]}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingBottom: 44,
            marginBottom: -42,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              paddingTop: 16,
            }}
            accessible
            accessibilityRole="header"
            accessibilityLabel="Serviço concluído"
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                borderWidth: 3,
                borderColor: colors.white,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Check size={30} color={colors.white} strokeWidth={3} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="h1" color={colors.white}>
                Serviço concluído
              </AppText>
              <AppText variant="body" color="#D3EFDF">
                {request.kind === "tow"
                  ? "A tua viatura chegou ao destino com sucesso."
                  : "A tua carga chegou ao destino com sucesso."}
              </AppText>
            </View>
          </View>
        </SafeAreaView>
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <Card style={{ gap: 12 }}>
            <View
              style={{ flexDirection: "row", gap: 12, alignItems: "center" }}
            >
              <View
                style={{
                  backgroundColor: "#F1F4F2",
                  borderRadius: radius.md,
                  padding: 4,
                }}
              >
                <VehicleImage
                  art={artFor[request.kind]}
                  width={84}
                  height={54}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="title">{serviceTitle[request.kind]}</AppText>
                <AppText variant="caption" color={colors.text}>
                  {request.origin.area} → {request.destination.area}
                </AppText>
                <AppText variant="tiny" color={colors.muted}>
                  Hoje, {formatTime(started)} • {request.distanceKm} km •{" "}
                  {formatDuration(request.durationMin)}
                </AppText>
              </View>
            </View>
            <MapPreview
              height={150}
              rounded={radius.md}
              static
              route={{
                from: request.origin.coords,
                to: request.destination.coords,
              }}
              markers={[
                {
                  id: "o",
                  kind: "origin",
                  coords: request.origin.coords,
                  label: request.origin.area,
                },
                {
                  id: "d",
                  kind: "origin",
                  coords: request.destination.coords,
                  label: request.destination.area,
                },
              ]}
            />
          </Card>
          <AppText
            variant="h2"
            accessibilityRole="header"
            style={{ marginTop: 6 }}
          >
            Como pretendes pagar?
          </AppText>
          <View accessibilityRole="radiogroup" style={{ gap: 10 }}>
            {(Object.keys(paymentKindCopy) as PaymentMethodKind[]).map(
              (kind) => {
                const Icon = icons[kind];
                return (
                  <SelectionCard
                    key={kind}
                    title={paymentKindCopy[kind].title}
                    description={paymentKindCopy[kind].detail}
                    selected={method === kind}
                    indicator="check"
                    onPress={() => setMethod(kind)}
                    media={
                      <Icon size={28} color={colors.ink} strokeWidth={1.8} />
                    }
                  />
                );
              },
            )}
          </View>
          <Card tone="muted" style={{ gap: 2 }}>
            <AppText variant="body">Total a pagar</AppText>
            <AnimatedAmount value={request.price.total} weight="extrabold" style={{ fontSize: 34, lineHeight: 42 }} />
          </Card>
        </View>
      </ScreenContainer>
      <SheetModal ref={reference} title="Referência Multicaixa">
        <AppText variant="body" color={colors.muted}>
          Paga num Multicaixa ou no Internet Banking com estes dados
          (simulados).
        </AppText>
        <Card tone="soft" style={{ gap: 10 }}>
          {[
            ["Entidade", "00123"],
            [
              "Referência",
              `${request.code
                .replace(/\D/g, "")
                .padStart(9, "4")
                .replace(/(\d{3})(?=\d)/g, "$1 ")}`,
            ],
            ["Montante", formatKz(request.price.total)],
          ].map(([k, v], i) => (
            <View key={k}>
              {i ? <Divider /> : null}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 4,
                }}
              >
                <AppText variant="body" color={colors.muted}>
                  {k}
                </AppText>
                <AppText variant="title" selectable>
                  {v}
                </AppText>
              </View>
            </View>
          ))}
        </Card>
        <InfoNote>
          Nenhum pagamento real é feito nesta fase. Toca em «Já paguei» para
          simular a confirmação.
        </InfoNote>
        <PrimaryButton
          label="Já paguei"
          loading={pay.isPending}
          onPress={() => pay.mutate()}
        />
      </SheetModal>
    </View>
  );
}
