import { useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { CircleHelp, CreditCard, MessagesSquare, Search } from "lucide-react-native";
import { AppHeader, AppText, Card, ListRow, ScreenContainer, TextField, TowTruckIcon } from "@/components/kit";
import { illustrations } from "@/mocks/assets";
import { useHelpSearch } from "@/services/queries";
import { go } from "@/features/navigation";
import { colors } from "@/theme/colors";

/** 33 · Ajuda e suporte: pesquisa, temas, falar com o suporte e SOS. */
export default function HelpScreen() {
  const [query, setQuery] = useState("");
  const { data } = useHelpSearch(query);
  return (
    <ScreenContainer header={<AppHeader title="Ajuda e suporte" align="center" />} gap={12}>
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 24, overflow: "hidden", minHeight: 170 }}>
        <AppText variant="h1" accessibilityRole="header" style={{ flex: 1, paddingLeft: 18 }}>
          Como{"\n"}podemos ajudar?
        </AppText>
        <Image source={illustrations.supportAgent} style={{ width: 160, height: 190 }} contentFit="cover" accessibilityLabel="" />
      </View>
      <TextField placeholder="Pesquisar ajuda..." accessibilityLabel="Pesquisar ajuda" icon={<Search size={22} color={colors.ink} />} value={query} onChangeText={setQuery} returnKeyType="search" />
      {query ? (
        <Card style={{ gap: 10 }}>
          <AppText variant="label" color={colors.muted}>
            {data?.length ? `${data.length} resultado${data.length > 1 ? "s" : ""}` : "Sem resultados — fala connosco pelo chat."}
          </AppText>
          {data?.map((topic) => (
            <ListRow key={topic.id} variant="plain" title={topic.question} onPress={() => go(`/help/faq?open=${topic.id}`)} />
          ))}
        </Card>
      ) : null}
      <ListRow icon={<TowTruckIcon size={26} color={colors.primary} />} title="Problema com um pedido" onPress={() => go("/help/report")} />
      <ListRow icon={<CreditCard size={24} color={colors.primary} />} title="Pagamento e recibos" onPress={() => go("/help/faq?category=payments")} />
      <ListRow icon={<CircleHelp size={24} color={colors.primary} />} title="Perguntas frequentes" onPress={() => go("/help/faq")} />
      <ListRow tone="primary" icon={<MessagesSquare size={26} color={colors.white} />} title="Falar com o suporte" subtitle="Resposta em poucos minutos" onPress={() => go("/help/chat")} />
      <ListRow tone="sos" icon={<AppText variant="label" weight="extrabold" color={colors.white}>SOS</AppText>} title="Emergência? Usa o botão SOS" onPress={() => go("/sos")} />
    </ScreenContainer>
  );
}
