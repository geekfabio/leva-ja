import { useState } from "react";
import { View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { AppHeader, AppText, ChoiceChip, EmptyState, PrimaryButton, ScreenContainer, ScreenTitle, SelectionCard, TextField } from "@/components/kit";
import { serviceTitle } from "@/features/booking/catalog";
import { useServiceStore } from "@/stores/useServiceStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { formatShortDateTime } from "@/utils/date";
import { toast } from "@/lib/toast";

const reasons = ["Atraso do prestador", "Carga danificada", "Valor cobrado incorrecto", "Comportamento do prestador", "Objecto esquecido", "Outro"];

/** Registar um problema com um pedido (ocorrência simulada). */
export default function ReportScreen() {
  const userId = useSessionStore((s) => s.user.id);
  const role = useSessionStore((s) => s.role);
  const requests = useServiceStore((s) => s.requests.filter((r) => (role === "provider" ? !!r.providerId : r.clientId === userId)).slice(0, 5));
  const [selected, setSelected] = useState(requests[0]?.id);
  const [reason, setReason] = useState<string>();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();
  const submit = useMutation({
    mutationFn: () => new Promise<string>((r) => setTimeout(() => r(`OC-${Math.floor(1000 + Math.random() * 8999)}`), 900)),
    onSuccess: (code) => {
      toast.success({ title: `Ocorrência ${code} registada`, message: "A equipa de suporte responde em até 24 horas." });
      router.back();
    },
  });
  if (!requests.length)
    return (
      <ScreenContainer header={<AppHeader title="Problema com um pedido" />}>
        <EmptyState title="Ainda sem pedidos" description="Quando tiveres pedidos, podes reportar problemas aqui." />
      </ScreenContainer>
    );
  return (
    <ScreenContainer
      header={<AppHeader title="Problema com um pedido" />}
      footer={
        <PrimaryButton
          label="Enviar ocorrência"
          loading={submit.isPending}
          onPress={() => {
            if (!reason) return setError("Escolhe o motivo.");
            if (note.trim().length < 10) return setError("Descreve o problema com pelo menos 10 caracteres.");
            setError(undefined);
            submit.mutate();
          }}
        />
      }
      gap={14}
    >
      <ScreenTitle title="O que aconteceu?" subtitle="Escolhe o pedido e conta-nos o problema." size="h2" />
      <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
        {requests.map((r) => (
          <SelectionCard key={r.id} title={`${serviceTitle[r.kind]} · ${r.code}`} description={`${r.origin.area} → ${r.destination.area} · ${formatShortDateTime(r.createdAt)}`} selected={selected === r.id} onPress={() => setSelected(r.id)} />
        ))}
      </View>
      <AppText variant="label" weight="bold">
        Motivo
      </AppText>
      <View accessibilityRole="radiogroup" style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {reasons.map((r) => (
          <ChoiceChip key={r} label={r} selected={reason === r} onPress={() => setReason(r)} />
        ))}
      </View>
      <TextField label="Descrição" multiline placeholder="Descreve o que aconteceu" value={note} onChangeText={setNote} maxLength={300} counter error={error} />
    </ScreenContainer>
  );
}
