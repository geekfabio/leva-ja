import { Linking } from "react-native";
import { toast } from "@/lib/toast";

/** Abre o marcador do telemóvel com o número da outra parte. */
export async function callPhone(phone: string | undefined) {
  const number = phone?.replace(/[^\d+]/g, "");
  if (!number) {
    toast.error({ title: "Sem número", message: "Esta pessoa ainda não tem um número de telefone." });
    return;
  }
  try {
    await Linking.openURL(`tel:${number}`);
  } catch {
    toast.error({ title: "Não foi possível ligar", message: "Este dispositivo não consegue fazer chamadas." });
  }
}
