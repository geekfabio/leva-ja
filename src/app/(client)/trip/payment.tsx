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
import { paymentKindCopy } from "@/features/payment/copy";
import { useAccountStore } from "@/stores/useAccountStore";
import { useServiceStore } from "@/stores/useServiceStore";
import type { Payment, PaymentMethodKind, ServiceRequest } from "@/types/domain";
import { dataSource } from "@/data";
import { formatTime } from "@/utils/date";
import { formatDuration, formatKz } from "@/utils/format";
import { swap } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors, radius } from "@/theme/colors";

const icons = { bank_reference: Landmark, card: CreditCard, cash: Banknote };
const artFor = (request: ServiceRequest) =>
  request.kind === "cargo" && request.cargo?.vehicleClass === "tuk_tuk"
    ? "tuk_tuk"
    : ({ tow: "tow", cargo: "pickup", small_move: "van", house_move: "box" } as const)[request.kind];

/**
 * 29 · Serviço concluído e escolha do pagamento. Cartão e numerário confirmam
 * logo; a referência Multicaixa é pedida à API e o pedido passa a pago quando
 * o banco confirma (chega pelo tempo real e o ecrã segue para o recibo).
 */
export default function PaymentScreen() {
  const request = useActiveClientRequest();
  useStatusRoute(request, ["delivered"]);
  const defaultKind = useAccountStore(
    (s) => s.paymentMethods.find((p) => p.isDefault)?.kind ?? "bank_reference",
  );
  const [method, setMethod] = useState<PaymentMethodKind>(defaultKind);
  const reference = useRef<BottomSheetModal>(null);
  const [pending, setPending] = useState<Payment | null>(null);
  const pay = useMutation({
    mutationFn: async () => {
      const payment = await useServiceStore.getState().startPayment(request!.id, method);
      if (!payment) throw new Error(useServiceStore.getState().lastError ?? "Estado inválido");
      return payment;
    },
    onSuccess: (payment) => {
      if (payment.status === "pending") {
        setPending(payment);
        reference.current?.present();
        return;
      }
      reference.current?.dismiss();
      swap("/trip/receipt");
    },
    onError: () =>
      toast.error({
        title: "Pagamento não concluído",
        message: "Tenta novamente ou escolhe outro método.",
      }),
  });
  const check = useMutation({
    mutationFn: async () => useServiceStore.getState().checkPayment(pending!),
    onSuccess: (payment) => {
      if (payment?.status === "confirmed") {
        reference.current?.dismiss();
        swap("/trip/receipt");
      } else {
        toast.info({ title: "Ainda não recebemos a confirmação", message: "O banco pode demorar alguns minutos. Avisamos-te quando chegar." });
      }
    },
  });
  if (!request) return <NoActiveRequest />;

  const proceed = () => pay.mutate();
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
            loading={pay.isPending}
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
                  art={artFor(request)}
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
          Paga num Multicaixa ou no Internet Banking com estes dados. A
          confirmação chega automaticamente.
        </AppText>
        <Card tone="soft" style={{ gap: 10 }}>
          {[
            ["Entidade", pending?.reference?.entity ?? "—"],
            ["Referência", (pending?.reference?.reference ?? "").replace(/(\d{3})(?=\d)/g, "$1 ") || "—"],
            ["Montante", formatKz(pending?.amount ?? request.price.total)],
            ["Válida até", pending?.reference ? `${formatTime(pending.reference.expiresAt)} · ${new Date(pending.reference.expiresAt).toLocaleDateString("pt-PT")}` : "—"],
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
        {dataSource === "mock" ? (
          <InfoNote>
            Demonstração: nenhum valor é cobrado e o banco confirma o
            pagamento ao fim de alguns segundos.
          </InfoNote>
        ) : null}
        <PrimaryButton
          label="Já paguei"
          loading={check.isPending}
          onPress={() => check.mutate()}
        />
      </SheetModal>
    </View>
  );
}
