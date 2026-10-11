import { Text, View } from "react-native";
const tones = {
  success: { backgroundColor: "#E5F8EE", color: "#087F4F" },
  warning: { backgroundColor: "#FFF3D6", color: "#855300" },
  danger: { backgroundColor: "#FEE9E7", color: "#B42318" },
  info: { backgroundColor: "#EAF1FF", color: "#2457A8" },
  neutral: { backgroundColor: "#EEF1EF", color: "#53635A" },
};
const statuses: Record<string, keyof typeof tones> = {
  aprovado: "success",
  confirmado: "success",
  concluído: "success",
  aceite: "success",
  activo: "success",
  pendente: "warning",
  "em análise": "warning",
  "em disputa": "warning",
  "a procurar": "warning",
  disponível: "info",
  falhou: "danger",
  bloqueado: "danger",
  aberto: "danger",
  cancelado: "neutral",
  reembolsado: "info",
  "a caminho": "info",
  "no local": "success",
  "em serviço": "info",
};
export function StatusBadge({ status }: { status: string }) {
  const tone = tones[statuses[status.toLowerCase()] || "neutral"];
  return (
    <View
      style={{
        backgroundColor: tone.backgroundColor,
        borderRadius: 100,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: tone.color, fontSize: 12, fontWeight: "700" }}>
        {status}
      </Text>
    </View>
  );
}
