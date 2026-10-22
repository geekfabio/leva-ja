import {View} from "react-native";
import { MessageCircle, Phone, Share2 } from "lucide-react-native";
import { colors, radius } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import { ScalePressable } from "@/components/core/Motion";

type Props = {
  onChat: () => void;
  onCall: () => void;
  onShare?: () => void;
  /** row: botões largos com texto (ref. 23); compact: ícones redondos com legenda (ref. 36). */
  variant?: "row" | "compact";
  unread?: number;
};

export function ContactActions({ onChat, onCall, onShare, variant = "row", unread = 0 }: Props) {
  const actions = [
    { key: "chat", label: "Chat", Icon: MessageCircle, onPress: onChat },
    { key: "call", label: "Ligar", Icon: Phone, onPress: onCall },
    ...(onShare ? [{ key: "share", label: "Partilhar", Icon: Share2, onPress: onShare }] : []),
  ];
  if (variant === "compact")
    return (
      <View style={{ flexDirection: "row", gap: 14 }}>
        {actions.map(({ key, label, Icon, onPress }) => (
          <ScalePressable key={key} accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={6} style={{ alignItems: "center", gap: 4 }}>
            {({ pressed }) => (
              <>
                <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: pressed ? colors.primaryTint : colors.primarySoft, alignItems: "center", justifyContent: "center" }}>
                  <Icon size={22} color={colors.primary} />
                  {key === "chat" && unread ? <Badge count={unread} /> : null}
                </View>
                <AppText variant="tiny">{label}</AppText>
              </>
            )}
          </ScalePressable>
        ))}
      </View>
    );
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      {actions.map(({ key, label, Icon, onPress }) => (
        <ScalePressable
          key={key}
          accessibilityRole="button"
          accessibilityLabel={label}
          onPress={onPress}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 52,
            borderRadius: radius.md,
            backgroundColor: pressed ? colors.primaryTint : "#F1F4F2",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          })}
        >
          <Icon size={22} color={colors.ink} />
          <AppText variant="label" weight="bold">
            {label}
          </AppText>
          {key === "chat" && unread ? <Badge count={unread} /> : null}
        </ScalePressable>
      ))}
    </View>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <View accessibilityLabel={`${count} mensagens por ler`} style={{ position: "absolute", top: 4, right: 6, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.danger, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 }}>
      <AppText variant="tiny" weight="bold" color={colors.white}>
        {count}
      </AppText>
    </View>
  );
}
