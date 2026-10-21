import { useState } from "react";
import { View } from "react-native";
import { FileUp } from "lucide-react-native";
import { AccountStatusCard, AppText, DocumentStatus, PrimaryButton, ScreenContainer, Appear } from "@/components/kit";
import { ProviderHeader, ProviderSummaryCard } from "@/components/partner/ProviderHeader";
import { useProviderStore } from "@/stores/useProviderStore";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/colors";

/** 43 · Documentos e estado de validação. O envio é simulado e valida-se sozinho. */
export default function DocumentsScreen() {
  const documents = useProviderStore((s) => s.documents);
  const [selected, setSelected] = useState(() => documents.find((d) => d.state !== "verified")?.id ?? documents[0]?.id);
  const doc = documents.find((d) => d.id === selected);
  const submit = () => {
    if (!doc) return;
    useProviderStore.getState().submitDocument(doc.id);
    toast.success({ title: "Documento enviado", message: `${doc.title} está em análise (simulado).` });
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ProviderHeader title="Documentos" back />
      <ScreenContainer edges={[]} gap={12} contentStyle={{ paddingTop: 16 }} footer={<PrimaryButton label={doc ? `Actualizar ${doc.title.toLowerCase()}` : "Actualizar documento"} icon={<FileUp size={22} color={colors.white} />} disabled={!doc || doc.state === "pending"} onPress={submit} />}>
        <ProviderSummaryCard />
        <AccountStatusCard documents={documents} />
        <AppText variant="caption" color={colors.muted}>
          Toca num documento para o seleccionar e actualizar.
        </AppText>
        {documents.map((d, i) => (
          <Appear key={d.id} index={i}>
            <DocumentStatus document={d} selected={d.id === selected} onPress={() => setSelected(d.id)} />
          </Appear>
        ))}
      </ScreenContainer>
    </View>
  );
}
