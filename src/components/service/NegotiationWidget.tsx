import { View } from "react-native";
import { Minus, Plus } from "lucide-react-native";
import type { Negotiation, NegotiationSide } from "@/types/domain";
import { AppText, Card, IconButton, PrimaryButton, SecondaryButton } from "@/components/kit";
import { formatKz } from "@/utils/format";
import { colors } from "@/theme/colors";

type Props = {
  negotiation: Negotiation;
  /** De quem é este widget: o próprio cliente ou o próprio prestador. */
  side: NegotiationSide;
  platformFee: number;
  pending?: boolean;
  onAdjust: (direction: "up" | "down") => void;
  onAccept: () => void;
  onDecline: () => void;
};

/** Negociação de preço em passos de 50 Kz, dentro de ±15% da estimativa (ref. novo fluxo, todos os serviços). */
export function NegotiationWidget({ negotiation, side, platformFee, pending, onAdjust, onAccept, onDecline }: Props) {
  const myTurn = negotiation.by !== side;
  const canDown = !pending && myTurn && negotiation.amount > negotiation.minAmount;
  const canUp = !pending && myTurn && negotiation.amount < negotiation.maxAmount;
  const total = negotiation.amount + platformFee;

  return (
    <Card style={{ gap: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <AppText variant="label" color={colors.muted}>
          {negotiation.by === side ? "A tua última proposta" : "Proposta do outro lado"}
        </AppText>
        <AppText variant="tiny" color={colors.muted}>
          Entre {formatKz(negotiation.minAmount + platformFee)} e {formatKz(negotiation.maxAmount + platformFee)}
        </AppText>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <IconButton
          variant="soft"
          size={48}
          label="Descer 50 Kz"
          icon={<Minus size={22} color={canDown ? colors.primary : colors.subtle} />}
          onPress={canDown ? () => onAdjust("down") : undefined}
        />
        <AppText variant="h1" accessibilityLabel={`Valor actual: ${formatKz(total)}`}>
          {formatKz(total)}
        </AppText>
        <IconButton
          variant="soft"
          size={48}
          label="Subir 50 Kz"
          icon={<Plus size={22} color={canUp ? colors.primary : colors.subtle} />}
          onPress={canUp ? () => onAdjust("up") : undefined}
        />
      </View>
      {myTurn ? (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <SecondaryButton style={{ flex: 1 }} label="Recusar" onPress={onDecline} disabled={pending} />
          <PrimaryButton style={{ flex: 1.3 }} label="Aceitar" onPress={onAccept} disabled={pending} loading={pending} />
        </View>
      ) : (
        <AppText variant="caption" color={colors.muted} align="center">
          À espera da resposta do outro lado.
        </AppText>
      )}
    </Card>
  );
}
