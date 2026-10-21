import { useState } from "react";
import { Pressable, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ChevronDown, ChevronUp, Search } from "lucide-react-native";
import { AppHeader, AppText, Card, EmptyState, ErrorState, LoadingState, PrimaryButton, ScreenContainer, SegmentedTabs, TextField } from "@/components/kit";
import { useHelpSearch } from "@/services/queries";
import { go } from "@/features/navigation";
import { colors } from "@/theme/colors";

const categories = [
  { value: "all", label: "Todas" },
  { value: "orders", label: "Pedidos" },
  { value: "payments", label: "Pagamentos" },
  { value: "safety", label: "Segurança" },
  { value: "account", label: "Conta" },
] as const;

/** Perguntas frequentes com pesquisa e filtros. */
export default function FaqScreen() {
  const params = useLocalSearchParams<{ category?: string; open?: string }>();
  const [category, setCategory] = useState<string>(params.category ?? "all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | undefined>(params.open);
  const { data, isLoading, isError, refetch } = useHelpSearch(query, category === "all" ? undefined : category);
  return (
    <ScreenContainer header={<AppHeader title="Perguntas frequentes" />} gap={12}>
      <TextField placeholder="Pesquisar" accessibilityLabel="Pesquisar perguntas" icon={<Search size={20} color={colors.muted} />} value={query} onChangeText={setQuery} />
      <SegmentedTabs options={categories.map((c) => ({ value: c.value, label: c.label }))} value={category} onChange={setCategory} />
      {isLoading ? <LoadingState rows={4} /> : null}
      {isError ? <ErrorState onRetry={refetch} /> : null}
      {data && !data.length ? <EmptyState title="Sem resultados" description="Experimenta outras palavras ou fala com o suporte." actionLabel="Falar com o suporte" onAction={() => go("/help/chat")} /> : null}
      {data?.map((topic) => {
        const expanded = open === topic.id;
        return (
          <Card key={topic.id} padding={0}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              accessibilityLabel={topic.question}
              onPress={() => setOpen(expanded ? undefined : topic.id)}
              style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, minHeight: 56 }}
            >
              <AppText variant="title" weight="semibold" style={{ flex: 1 }}>
                {topic.question}
              </AppText>
              {expanded ? <ChevronUp size={22} color={colors.text} /> : <ChevronDown size={22} color={colors.text} />}
            </Pressable>
            {expanded ? (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                <AppText variant="body" color={colors.text}>
                  {topic.answer}
                </AppText>
              </View>
            ) : null}
          </Card>
        );
      })}
      <PrimaryButton label="Ainda precisas de ajuda? Fala connosco" size="md" onPress={() => go("/help/chat")} />
    </ScreenContainer>
  );
}
