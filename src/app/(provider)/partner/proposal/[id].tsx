import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Coins, FileText, Info, MapPin, MessageSquareText, Phone, Send, UserRound } from "lucide-react-native";
import { AppText, Avatar, BrandLogo, Card, Divider, EmptyState, IconButton, IconCircle, InfoNote, PrimaryButton, ScreenContainer, SecondaryButton, ServiceIcon, StatusBadge, TextField, VehicleImage } from "@/components/kit";
import { NotificationBell } from "@/components/partner/ProviderHeader";
import { serviceTitle } from "@/features/booking/catalog";
import { proposalSchema, type ProposalForm } from "@/features/provider/schemas";
import { useRequest, useServiceStore } from "@/stores/useServiceStore";
import { formatKz, formatNumber, parseAmount } from "@/utils/format";
import { go, swap } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors, radius } from "@/theme/colors";
import { clientOf } from "@/features/service/people";
import { useMyProvider } from "@/features/provider/useProvider";

/** 45 · Proposta de preço para serviços complexos (mudança de casa). */
export default function ProposalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const request = useRequest(id);
  const me = useMyProvider();
  const vehicle = me.vehicle;
  const suggested = request ? request.price.total - request.price.platformFee : 0;
  const { control, handleSubmit, formState } = useForm<ProposalForm>({
    resolver: zodResolver(proposalSchema),
    defaultValues: { amount: Math.round((suggested + 3500) / 500) * 500, reason: request?.instructions ?? "" },
  });
  const header = (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.deep, paddingHorizontal: 12, paddingBottom: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <IconButton label="Voltar" icon={<ArrowLeft size={24} color={colors.white} />} onPress={() => router.back()} />
        <View style={{ flex: 1 }}>
          <BrandLogo inverse size="sm" tagline="Parceiro" />
        </View>
        <NotificationBell inverse />
        <Avatar name={me.name} initials={me.initials} photo={me.avatar} size={40} verified />
      </View>
    </SafeAreaView>
  );
  if (!request || !["searching", "assigned"].includes(request.status))
    return (
      <ScreenContainer header={header}>
        <EmptyState title="Proposta indisponível" description="Este pedido já não está disponível." actionLabel="Ver pedidos" onAction={() => swap("/partner/requests")} />
      </ScreenContainer>
    );
  const client = clientOf(request);
  const proposal = request.proposal;
  const mine = request.providerId === me.id;

  if (proposal && mine && (proposal.status === "sent" || proposal.status === "accepted"))
    return (
      <ScreenContainer header={header} gap={14} contentStyle={{ paddingTop: 16 }}>
        <Card style={{ gap: 10, alignItems: "center", paddingVertical: 24 }}>
          <IconCircle size={72}>
            <Send size={32} color={colors.primary} />
          </IconCircle>
          <AppText variant="h2" align="center">
            {proposal.status === "accepted" ? "Proposta aceite!" : "Proposta enviada"}
          </AppText>
          <AppText variant="body" color={colors.muted} align="center">
            {proposal.status === "accepted" ? `${client.name} aceitou ${formatKz(proposal.amount)}.` : `A aguardar a resposta de ${client.name}.`}
          </AppText>
          <StatusBadge label={formatKz(proposal.amount)} tone={proposal.status === "accepted" ? "success" : "warning"} />
        </Card>
        <InfoNote>{`Motivo: “${proposal.reason}”`}</InfoNote>
        {proposal.status === "sent" ? (
          <>
            <PrimaryButton label="Simular aceitação do cliente" onPress={() => useServiceStore.getState().answerProposal(request.id, true)} />
            <SecondaryButton label="Simular recusa do cliente" onPress={async () => { await useServiceStore.getState().answerProposal(request.id, false); toast.info("O cliente recusou a proposta"); swap("/partner/requests"); }} />
          </>
        ) : (
          <PrimaryButton label="Iniciar serviço" onPress={() => swap(`/partner/active/${request.id}`)} />
        )}
      </ScreenContainer>
    );

  const send = handleSubmit(async (values) => {
    if (await useServiceStore.getState().submitProposal(request.id, values.amount, values.reason)) toast.success({ title: "Proposta enviada", message: "Vais ser notificado quando o cliente responder." });
    else toast.error({ title: "Proposta não enviada", message: useServiceStore.getState().lastError ?? undefined });
  });

  return (
    <ScreenContainer header={header} footer={<PrimaryButton label="Enviar proposta" loading={formState.isSubmitting} icon={<Send size={22} color={colors.white} />} onPress={send} />} gap={14} contentStyle={{ paddingTop: 16 }}>
      <Card tone="soft" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <VehicleImage art="pickup" width={120} height={70} />
        <View style={{ flex: 1 }}>
          <AppText variant="title">
            {vehicle.brand} {vehicle.model}
          </AppText>
          <View style={{ alignSelf: "flex-start", backgroundColor: colors.card, borderRadius: 6, paddingHorizontal: 8, marginVertical: 2 }}>
            <AppText variant="label" weight="bold">
              {vehicle.plate}
            </AppText>
          </View>
          <AppText variant="caption" color={colors.muted}>
            Pickup · Carga e Mudanças
          </AppText>
        </View>
      </Card>
      <View>
        <AppText variant="h1" accessibilityRole="header">
          Propor valor ao cliente
        </AppText>
        <AppText variant="body" color={colors.muted}>
          Revê os detalhes do serviço e envia a tua proposta.
        </AppText>
      </View>
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
          <IconCircle size={60} shape="rounded">
            <ServiceIcon kind={request.kind} size={30} color={colors.ink} />
          </IconCircle>
          <View>
            <AppText variant="h3">{serviceTitle[request.kind]}</AppText>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <MapPin size={15} color={colors.ink} />
              <AppText variant="body">
                {request.origin.area} → {request.destination.area}
              </AppText>
            </View>
          </View>
        </View>
        <Divider />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <UserRound size={22} color={colors.ink} />
          <AppText variant="body" style={{ flex: 1 }}>
            Cliente: {client.name}
          </AppText>
          <IconButton variant="soft" label={`Ligar a ${client.name}`} icon={<Phone size={20} color={colors.primary} />} onPress={() => go(`/partner/call/${request.id}`)} />
          <IconButton variant="soft" label={`Mensagem a ${client.name}`} icon={<MessageSquareText size={20} color={colors.primary} />} onPress={() => go(`/partner/chat/${request.id}`)} />
        </View>
      </Card>
      <View style={{ gap: 6, backgroundColor: "#EEF2F0", borderRadius: radius.lg, padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <AppText variant="label">Valor sugerido</AppText>
          <Info size={16} color={colors.ink} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Coins size={24} color={colors.ink} />
          <AppText variant="h1">{formatKz(suggested)}</AppText>
        </View>
        <AppText variant="caption" color={colors.muted}>
          Com base na distância, tipo de serviço e média de preços na tua zona.
        </AppText>
      </View>
      <Controller
        control={control}
        name="amount"
        render={({ field, fieldState }) => (
          <TextField
            label="A tua proposta"
            large
            keyboardType="number-pad"
            icon={<Coins size={22} color={colors.muted} />}
            suffix={<AppText variant="h3" color={colors.muted}>Kz</AppText>}
            value={field.value ? formatNumber(field.value) : ""}
            onChangeText={(t) => field.onChange(parseAmount(t))}
            error={fieldState.error?.message}
            hint="Define um valor justo e competitivo para o cliente."
          />
        )}
      />
      <Controller
        control={control}
        name="reason"
        render={({ field, fieldState }) => (
          <TextField label="Motivo do ajuste" multiline icon={<FileText size={20} color={colors.muted} />} value={field.value} onChangeText={field.onChange} maxLength={200} counter error={fieldState.error?.message} hint="Explica de forma clara o que está incluído no valor proposto." />
        )}
      />
    </ScreenContainer>
  );
}
