import { forwardRef } from "react";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { MessageCircle, Phone } from "lucide-react-native";
import { ListRow } from "@/components/core/ListRow";
import { SheetModal } from "@/components/core/SheetModal";
import { colors } from "@/theme/colors";

/** Escolha entre chat e chamada simulados. */
export const ContactSheet = forwardRef<BottomSheetModal, { name: string; onChat: () => void; onCall: () => void }>(function ContactSheet({ name, onChat, onCall }, ref) {
  return (
    <SheetModal ref={ref} title={`Contactar ${name.split(" ")[0]}`}>
      <ListRow icon={<MessageCircle size={24} color={colors.primary} />} title="Enviar mensagem" subtitle="Chat dentro da app" onPress={onChat} />
      <ListRow icon={<Phone size={24} color={colors.primary} />} title="Ligar" subtitle="Chamada simulada, sem custos" onPress={onCall} />
    </SheetModal>
  );
});
