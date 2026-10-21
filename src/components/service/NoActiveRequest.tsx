import { Truck } from "lucide-react-native";
import { AppHeader } from "@/components/core/AppHeader";
import { ScreenContainer } from "@/components/core/ScreenContainer";
import { EmptyState } from "@/components/core/States";
import { swap } from "@/features/navigation";
import { colors } from "@/theme/colors";

/** Estado vazio quando se abre um ecrã de acompanhamento sem pedido activo. */
export function NoActiveRequest() {
  return (
    <ScreenContainer header={<AppHeader />}>
      <EmptyState
        icon={<Truck size={32} color={colors.primary} />}
        title="Sem pedido em curso"
        description="Faz um pedido de reboque, carga ou mudança para o acompanhares aqui."
        actionLabel="Voltar ao início"
        onAction={() => swap("/home")}
      />
    </ScreenContainer>
  );
}
