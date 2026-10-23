import { useRef, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ChevronRight, FileText, XCircle } from "lucide-react-native";
import {
  AppHeader,
  AppText,
  Card,
  DeliveryProofSummary,
  Divider,
  ListRow,
  PriceSummary,
  PrimaryButton,
  RatingStars,
  RouteTimeline,
  ScreenContainer,
  SheetModal,
  StatusBadge,
  TextField,
  VehicleImage,
} from "@/components/kit";
import { NoActiveRequest } from "@/components/service/NoActiveRequest";
import { SuccessBurst } from "@/components/service/SuccessBurst";
import { serviceTitle } from "@/features/booking/catalog";
import { describeLoad } from "@/features/booking/factory";
import { paymentKindCopy } from "@/features/payment/copy";
import { useRequest, useServiceStore } from "@/stores/useServiceStore";
import { formatLongDateTime, formatShortDateTime, formatTime } from "@/utils/date";
import { formatKz } from "@/utils/format";
import { swap } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/colors";
import type { ServiceRequest } from "@/types/domain";

const artFor = (request: ServiceRequest) =>
  request.kind === "cargo" && request.cargo?.vehicleClass === "tuk_tuk"
    ? "tuk_tuk"
    : ({ tow: "tow", cargo: "pickup", small_move: "van", house_move: "box" } as const)[request.kind];
const descriptions = {
  tow: "Reboque plataforma para ligeiros e SUV em Luanda",
  cargo: "Transporte de carga e mudanças com pickup em Luanda",
  small_move: "Carrinha com ajudantes para poucos móveis",
  house_move: "Camião de mudanças com equipa completa",
};

const descriptionFor = (request: ServiceRequest) =>
  request.kind === "cargo" && request.cargo?.vehicleClass === "tuk_tuk"
    ? "Entrega rápida de pequenas mercadorias por tuk-tuk em Luanda"
    : descriptions[request.kind];

/** 30 · Recibo e avaliação. Também abre recibos do histórico com `?id=`. */
export default function ReceiptScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const activeId = useServiceStore((s) => s.activeClientRequestId);
  const request = useRequest(params.id ?? activeId);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const full = useRef<BottomSheetModal>(null);
  if (!request) return <NoActiveRequest />;
  const provider = request?.provider;
  const pickupAt = request.timeline.find((e) => e.status === "pickup_confirmed" || e.status === "en_route")?.at ?? request.createdAt;
  const deliveredAt = request.timeline.find((e) => e.status === "delivered")?.at ?? request.createdAt;
  const day = (iso: string) => formatShortDateTime(iso).split(",")[0];
  const fromHistory = !!params.id;

  if (request.status === "cancelled")
    return (
      <ScreenContainer header={<AppHeader title={`Pedido ${request.code}`} />} gap={14}>
        <Card style={{ alignItems: "center", gap: 10, paddingVertical: 24 }}>
          <XCircle size={48} color={colors.muted} />
          <AppText variant="h2">Pedido cancelado</AppText>
          <AppText variant="body" color={colors.muted} align="center">
            {request.cancelReason ?? "Cancelado antes da recolha."} Não foi cobrado nenhum valor.
          </AppText>
        </Card>
        <Card style={{ gap: 12 }}>
          <AppText variant="title">{serviceTitle[request.kind]}</AppText>
          <RouteTimeline stops={[{ label: "Recolha", place: request.origin.label }, { label: "Entrega", place: request.destination.label }]} />
          <AppText variant="caption" color={colors.muted}>
            Criado em {formatLongDateTime(request.createdAt)}
          </AppText>
        </Card>
      </ScreenContainer>
    );

  const canRate = request.status === "paid";
  const submit = async () => {
    if (!rating) return toast.info("Escolhe de 1 a 5 estrelas");
    if (!(await useServiceStore.getState().rate(request.id, rating, review.trim() || undefined))) return toast.error({ title: "Avaliação não enviada", message: useServiceStore.getState().lastError ?? undefined });
    toast.success({ title: "Obrigado pela avaliação!", message: "A tua opinião ajuda-nos a melhorar." });
    swap("/home");
  };

  return (
    <ScreenContainer header={fromHistory ? <AppHeader title="Recibo" /> : undefined} gap={14} contentStyle={{ paddingTop: fromHistory ? 0 : 24 }}>
      {!fromHistory ? (
        <View style={{ alignItems: "center", gap: 4 }}>
          <SuccessBurst size={64} />
          <AppText variant="h2" align="center" accessibilityRole="header">
            Obrigado por escolher a Leva Já
          </AppText>
          <AppText variant="body" color={colors.muted}>
            Pagamento confirmado
          </AppText>
        </View>
      ) : null}
      <Card style={{ gap: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View>
            <AppText variant="h3">Recibo #{request.code}</AppText>
            <AppText variant="body" color={colors.muted}>
              {serviceTitle[request.kind]}
            </AppText>
          </View>
          <AppText variant="h3" color={colors.primary}>
            {formatKz(request.price.total)}
          </AppText>
        </View>
        <Divider />
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <VehicleImage art={artFor(request)} width={100} height={62} />
          <View style={{ flex: 1 }}>
            <AppText variant="label" weight="bold">
              {serviceTitle[request.kind]}
            </AppText>
            <AppText variant="caption" color={colors.muted}>
              {descriptionFor(request)}
            </AppText>
          </View>
        </View>
        <Divider />
        <RouteTimeline
          stops={[
            { label: "Recolha", place: request.origin.label, time: formatTime(pickupAt), date: day(pickupAt) },
            { label: "Entrega", place: request.destination.label, time: formatTime(deliveredAt), date: day(deliveredAt) },
          ]}
        />
        <Divider />
        <PriceSummary price={request.price} totalLabel="Total pago" />
      </Card>
      {canRate ? (
        <Card style={{ gap: 12, alignItems: "stretch" }}>
          <AppText variant="h3" align="center">
            Como foi o serviço?
          </AppText>
          <AppText variant="caption" color={colors.muted} align="center">
            A sua opinião ajuda-nos a melhorar
          </AppText>
          <RatingStars value={rating} onChange={setRating} size={38} />
          {rating ? <TextField placeholder="Deixa um comentário (opcional)" accessibilityLabel="Comentário" value={review} onChangeText={setReview} maxLength={200} /> : null}
          <PrimaryButton label="Avaliar agora" onPress={submit} trailingIcon={<ChevronRight size={20} color={colors.white} />} />
        </Card>
      ) : request.rating ? (
        <Card style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <AppText variant="title">A tua avaliação</AppText>
            <StatusBadge status={request.status} />
          </View>
          <RatingStars value={request.rating} size={22} />
          {request.review ? (
            <AppText variant="body" color={colors.muted}>
              “{request.review}”
            </AppText>
          ) : null}
        </Card>
      ) : null}
      <ListRow icon={<FileText size={22} color={colors.primary} />} title="Ver recibo completo" onPress={() => full.current?.present()} />
      <SheetModal ref={full} title={`Recibo #${request.code}`} snapPoints={["85%"]}>
        {[
          ["Data", formatLongDateTime(deliveredAt)],
          ["Serviço", serviceTitle[request.kind]],
          ["Detalhes", describeLoad(request) || "—"],
          ["Prestador", provider ? `${provider.name} · ${provider.vehicle.plate}` : "—"],
          ["Distância", `${request.distanceKm} km`],
          ["Pagamento", request.paymentMethod ? paymentKindCopy[request.paymentMethod].title : "—"],
        ].map(([k, v]) => (
          <View key={k} style={{ flexDirection: "row", justifyContent: "space-between", gap: 16 }}>
            <AppText variant="body" color={colors.muted}>
              {k}
            </AppText>
            <AppText variant="body" weight="semibold" style={{ flexShrink: 1, textAlign: "right" }}>
              {v}
            </AppText>
          </View>
        ))}
        <Divider />
        <PriceSummary price={request.price} detailed totalLabel="Total pago" />
        {request.proof ? <DeliveryProofSummary proof={request.proof} /> : null}
        <AppText variant="tiny" color={colors.muted}>
          Documento sem valor fiscal — dados de demonstração.
        </AppText>
      </SheetModal>
    </ScreenContainer>
  );
}
