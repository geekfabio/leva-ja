import { useState } from "react";
import { Share, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Gift, Share2, Ticket, Users } from "lucide-react-native";
import { AppHeader, AppText, Card, EmptyState, ErrorState, IconCircle, InfoNote, LoadingState, PrimaryButton, ScreenContainer, SecondaryButton, TextField } from "@/components/kit";
import { repositories } from "@/data";
import { queryKeys, useReferral } from "@/services/queries";
import { formatKz } from "@/utils/format";
import { toast } from "@/lib/toast";
import { colors, radius } from "@/theme/colors";

/** Convidar amigos: partilhar o código, usar o de outra pessoa e ver os descontos ganhos. */
export default function InviteScreen() {
  const { data, isLoading, isError, refetch } = useReferral();
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");

  const redeem = useMutation({
    mutationFn: () => repositories().discounts.redeemReferral(code.trim()),
    onSuccess: (summary) => {
      queryClient.setQueryData(queryKeys.referral, summary);
      setCode("");
      toast.success({ title: "Código aceite", message: `Tens ${formatKz(summary.available)} de desconto no próximo pedido.` });
    },
  });

  const share = async () => {
    if (!data) return;
    const message = `Usa o meu código ${data.code} na AngoLeva e ganha ${formatKz(data.inviteeDiscount)} de desconto no teu primeiro pedido.`;
    try {
      await Share.share({ message });
    } catch {
      toast.info({ title: "O teu código", message: data.code });
    }
  };

  return (
    <ScreenContainer header={<AppHeader title="Convidar amigos" />} gap={14}>
      {isLoading ? (
        <LoadingState rows={3} />
      ) : isError || !data ? (
        <ErrorState onRetry={refetch} />
      ) : !data.enabled ? (
        <EmptyState title="Convites indisponíveis" description="De momento não há descontos por convite. Volta mais tarde." />
      ) : (
        <>
          <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: 18, gap: 12, alignItems: "center" }}>
            <IconCircle size={56} tone="white">
              <Gift size={28} color={colors.primary} />
            </IconCircle>
            <AppText variant="body" align="center">
              O teu amigo ganha {formatKz(data.inviteeDiscount)} no primeiro pedido. Quando esse pedido terminar, ganhas {formatKz(data.inviterDiscount)} no teu.
            </AppText>
            <View accessible accessibilityLabel={`O teu código de convite: ${data.code.split("").join(" ")}`} style={{ backgroundColor: colors.card, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 24 }}>
              <AppText variant="h1" style={{ letterSpacing: 4 }} selectable>
                {data.code}
              </AppText>
            </View>
            <PrimaryButton label="Partilhar código" icon={<Share2 size={20} color={colors.white} />} onPress={share} style={{ alignSelf: "stretch" }} />
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Card style={{ flex: 1, gap: 4 }}>
              <Users size={22} color={colors.primary} />
              <AppText variant="h2">{data.invitedCount}</AppText>
              <AppText variant="caption" color={colors.muted}>
                {data.invitedCount === 1 ? "amigo convidado" : "amigos convidados"}
              </AppText>
            </Card>
            <Card style={{ flex: 1, gap: 4 }}>
              <Ticket size={22} color={colors.primary} />
              <AppText variant="h2">{formatKz(data.available)}</AppText>
              <AppText variant="caption" color={colors.muted}>
                de desconto por usar
              </AppText>
            </Card>
          </View>
          {data.available > 0 ? <InfoNote tone="soft">O desconto aplica-se sozinho no teu próximo pedido, um de cada vez.</InfoNote> : null}

          {data.redeemed ? null : (
            <Card style={{ gap: 10 }}>
              <AppText variant="title">Tens um código de um amigo?</AppText>
              <TextField
                placeholder="Código de convite"
                accessibilityLabel="Código de convite de um amigo"
                autoCapitalize="characters"
                value={code}
                onChangeText={(text) => {
                  setCode(text);
                  if (redeem.isError) redeem.reset();
                }}
                error={redeem.isError ? (redeem.error instanceof Error ? redeem.error.message : "Código inválido.") : undefined}
              />
              <SecondaryButton size="md" label="Usar código" loading={redeem.isPending} disabled={!code.trim()} onPress={() => redeem.mutate()} />
              <AppText variant="caption" color={colors.muted}>
                Só funciona antes de concluíres o teu primeiro pedido.
              </AppText>
            </Card>
          )}
        </>
      )}
    </ScreenContainer>
  );
}
