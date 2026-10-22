import { useRef, useState } from "react";
import { View } from "react-native";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ChevronRight, MapPin, Star } from "lucide-react-native";
import { AppText, Avatar, Card, DeliveryProofSummary, EmptyState, ErrorState, IconCircle, LoadingState, PriceSummary, RatingStars, RouteTimeline, ScreenContainer, SecondaryButton, SegmentedTabs, ServiceIcon, SheetModal, StatusBadge, Appear } from "@/components/kit";
import { ProviderHeader } from "@/components/partner/ProviderHeader";
import { serviceTitle } from "@/features/booking/catalog";
import { useProviderRequests, useProviderReviews } from "@/services/queries";
import type { ServiceRequest } from "@/types/domain";
import { formatLongDateTime } from "@/utils/date";
import { formatKz, formatRating } from "@/utils/format";
import { colors } from "@/theme/colors";
import { clientOf } from "@/features/service/people";
import { useMyProvider } from "@/features/provider/useProvider";

/** 40 · Histórico de serviços concluídos/cancelados e avaliações recebidas. */
export default function ProviderHistory() {
  const me = useMyProvider();
  const [tab, setTab] = useState<"done" | "cancelled">("done");
  const [selected, setSelected] = useState<ServiceRequest>();
  const detail = useRef<BottomSheetModal>(null);
  const { data, isLoading, isError, refetch, isRefetching } = useProviderRequests();
  const reviews = useProviderReviews();
  const list = (data ?? []).filter((r) => (tab === "done" ? ["delivered", "paid", "rated"].includes(r.status) : r.status === "cancelled"));
  const open = (r: ServiceRequest) => {
    setSelected(r);
    detail.current?.present();
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ProviderHeader />
      <ScreenContainer edges={[]} gap={12} refreshing={isRefetching} onRefresh={refetch} contentStyle={{ paddingTop: 18 }}>
        <AppText variant="h1" accessibilityRole="header">
          Histórico de serviços
        </AppText>
        <Card tone="soft" style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Star size={22} color={colors.star} fill={colors.star} />
            <AppText variant="h3">{formatRating(me.rating)}</AppText>
            <AppText variant="caption" color={colors.muted}>
              · {me.reviewsCount} avaliações
            </AppText>
          </View>
          {reviews.data?.slice(0, 2).map((rv) => (
            <AppText key={rv.id} variant="caption" color={colors.text}>
              <AppText variant="caption" weight="bold">
                {rv.authorName}:
              </AppText>{" "}
              “{rv.comment}” {"★".repeat(rv.rating)}
            </AppText>
          ))}
        </Card>
        <SegmentedTabs
          variant="segmented"
          value={tab}
          onChange={setTab}
          options={[
            { value: "done", label: "Concluídos" },
            { value: "cancelled", label: "Cancelados" },
          ]}
        />
        {isLoading ? (
          <LoadingState rows={3} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : list.length ? (
          list.map((r, i) => {
            const client = clientOf(r);
            return (
              <Appear key={`${tab}-${r.id}`} index={i}>
              <Card style={{ gap: 12 }}>
                <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                  <IconCircle size={52} shape="rounded">
                    <ServiceIcon kind={r.kind} size={26} color={colors.ink} />
                  </IconCircle>
                  <View style={{ flex: 1 }}>
                    <AppText variant="title">{serviceTitle[r.kind]}</AppText>
                    <AppText variant="caption" color={colors.muted}>
                      {formatLongDateTime(r.createdAt)}
                    </AppText>
                  </View>
                  <StatusBadge status={r.status} />
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <MapPin size={16} color={colors.white} fill={colors.accent} />
                  <AppText variant="body">
                    {r.origin.area} → {r.destination.area}
                  </AppText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Avatar name={client.name} initials={client.initials} photo={client.avatar} size={40} />
                  {r.rating ? (
                    <>
                      <Star size={18} color={colors.star} fill={colors.star} />
                      <AppText variant="title">{formatRating(r.rating)}</AppText>
                    </>
                  ) : (
                    <AppText variant="caption" color={colors.muted}>
                      {r.status === "cancelled" ? r.cancelReason : "Sem avaliação"}
                    </AppText>
                  )}
                  <View style={{ flex: 1 }} />
                  <AppText variant="h3" color={r.status === "cancelled" ? colors.muted : colors.ink}>
                    {r.status === "cancelled" ? "—" : formatKz(r.providerEarning)}
                  </AppText>
                </View>
                <SecondaryButton size="md" label="Ver detalhes" trailingIcon={<ChevronRight size={18} color={colors.primary} />} onPress={() => open(r)} />
              </Card>
              </Appear>
            );
          })
        ) : (
          <EmptyState title={tab === "done" ? "Ainda sem serviços concluídos" : "Sem serviços cancelados"} />
        )}
      </ScreenContainer>
      <SheetModal ref={detail} title={selected ? `${serviceTitle[selected.kind]} · ${selected.code}` : "Detalhes"} snapPoints={["85%"]}>
        {selected ? (
          <>
            <RouteTimeline stops={[{ label: "Recolha", place: selected.origin.label }, { label: "Entrega", place: selected.destination.label }]} />
            <AppText variant="caption" color={colors.muted}>
              Cliente: {clientOf(selected).name}
            </AppText>
            {selected.rating ? (
              <Card tone="muted" style={{ gap: 6 }}>
                <RatingStars value={selected.rating} size={20} />
                {selected.review ? <AppText variant="body">“{selected.review}”</AppText> : null}
              </Card>
            ) : null}
            {selected.status !== "cancelled" ? <PriceSummary price={selected.price} totalLabel="Pago pelo cliente" /> : null}
            {selected.status !== "cancelled" ? (
              <AppText variant="label" color={colors.primary}>
                O teu ganho: {formatKz(selected.providerEarning)}
              </AppText>
            ) : null}
            {selected.proof ? <DeliveryProofSummary proof={selected.proof} /> : null}
          </>
        ) : null}
      </SheetModal>
    </View>
  );
}
