import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import {
  BadgeCheck,
  CarFront,
  ChevronRight,
  FileText,
  Headphones,
  History,
} from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppButton } from "@/components/ui/AppButton";
const rows = [
  {
    icon: BadgeCheck,
    title: "Documentos",
    text: "Consultar estado da aprovação",
    path: "/provider/onboarding",
  },
  {
    icon: History,
    title: "Histórico de serviços",
    text: "Os pedidos que já realizaste",
    path: "/provider/history",
  },
  {
    icon: Headphones,
    title: "Ajuda e incidentes",
    text: "Apoio para ti e para os teus serviços",
    path: "/provider/support",
  },
];
export default function ProviderProfile() {
  return (
    <View className="flex-1 bg-surface px-5 dark:bg-slate-950">
      <ScreenHeader title="O teu perfil" subtitle="Conta de parceiro" />
      <ScrollView contentContainerClassName="pb-8">
        <View className="items-center rounded-3xl bg-ink p-6">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-bright">
            <Text className="text-xl font-bold text-ink">JM</Text>
          </View>
          <Text className="mt-4 text-xl font-bold text-white">João Manuel</Text>
          <Text className="mt-1 text-slate-300">
            Prestador verificado · 4,9 ★
          </Text>
        </View>
        <View className="my-5 rounded-3xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <View className="flex-row gap-3">
            <CarFront size={22} color="#087F4F" />
            <View className="flex-1">
              <Text className="font-bold text-ink dark:text-white">
                Viaturas de transporte e apoio
              </Text>
              <Text className="mt-1 text-sm text-muted">
                Frota de demonstração · LD-42-18-AF
              </Text>
            </View>
          </View>
          <View className="mt-5 flex-row gap-3">
            <FileText size={22} color="#087F4F" />
            <View className="flex-1">
              <Text className="font-bold text-ink dark:text-white">
                Zonas de actuação
              </Text>
              <Text className="mt-1 text-sm text-muted">
                Ingombota, Maianga e Mutamba
              </Text>
            </View>
          </View>
        </View>
        {rows.map(({ icon: Icon, title, text, path }) => (
          <Pressable
            key={title}
            accessibilityRole="button"
            onPress={() => router.push(path as never)}
            className="mb-3 min-h-20 flex-row items-center gap-3 rounded-2xl border border-line bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <Icon size={22} color="#087F4F" />
            <View className="flex-1">
              <Text className="font-bold text-ink dark:text-white">
                {title}
              </Text>
              <Text className="mt-1 text-sm leading-5 text-muted">{text}</Text>
            </View>
            <ChevronRight size={19} color="#64746C" />
          </Pressable>
        ))}
        <View className="mt-4">
          <AppButton
            label="Voltar à entrada"
            variant="ghost"
            onPress={() => router.replace("/welcome")}
          />
        </View>
      </ScrollView>
    </View>
  );
}
