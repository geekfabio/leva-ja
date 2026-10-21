import { View } from "react-native";
import { Check } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import { ServiceIcon } from "./ServiceIcon";
import type { ServiceKind } from "@/types/domain";

/**
 * Progresso horizontal do serviço (ref. 23, 28, 36). `current` é o índice do
 * passo activo; os anteriores aparecem concluídos.
 */
export function ServiceTimeline({ steps, current, kind }: { steps: string[]; current: number; kind?: ServiceKind }) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Progresso: ${steps[current] ?? ""}, passo ${current + 1} de ${steps.length}`}
      style={{ flexDirection: "row", alignItems: "flex-start" }}
    >
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <View key={step} style={{ flex: 1, alignItems: "center", gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", alignSelf: "stretch", height: 36 }}>
              <View style={{ flex: 1, height: 3, backgroundColor: index === 0 ? "transparent" : index <= current ? colors.accent : colors.border }} />
              <View
                style={{
                  width: active ? 34 : 22,
                  height: active ? 34 : 22,
                  borderRadius: 17,
                  backgroundColor: done ? colors.accent : active ? colors.primarySoft : colors.card,
                  borderWidth: done ? 0 : 2.5,
                  borderColor: active ? colors.accent : colors.borderStrong,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {done ? <Check size={14} color={colors.white} strokeWidth={3} /> : null}
                {active ? (
                  kind ? (
                    <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }}>
                      <ServiceIcon kind={kind} size={15} color={colors.white} />
                    </View>
                  ) : (
                    <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: colors.accent }} />
                  )
                ) : null}
              </View>
              <View style={{ flex: 1, height: 3, backgroundColor: index === steps.length - 1 ? "transparent" : index < current ? colors.accent : colors.border }} />
            </View>
            <AppText variant="tiny" weight={active ? "bold" : "medium"} color={active ? colors.primary : colors.muted} align="center">
              {step}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

/** Recolha → Entrega na vertical com horas (ref. 10 recibo). */
export function RouteTimeline({
  stops,
}: {
  stops: { label: string; place: string; time?: string; date?: string }[];
}) {
  return (
    <View style={{ gap: 0 }}>
      {stops.map((stop, index) => {
        const last = index === stops.length - 1;
        return (
          <View key={stop.label + index} style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ alignItems: "center", width: 20 }}>
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  borderWidth: last ? 0 : 4,
                  borderColor: colors.accent,
                  backgroundColor: last ? colors.accent : colors.card,
                  marginTop: 2,
                }}
              />
              {!last ? <View style={{ flex: 1, width: 0, borderLeftWidth: 1.5, borderStyle: "dashed", borderColor: colors.borderStrong, marginVertical: 2 }} /> : null}
            </View>
            <View style={{ flex: 1, paddingBottom: last ? 0 : 16, flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <AppText variant="label" weight="bold">
                  {stop.label}
                </AppText>
                <AppText variant="caption" color={colors.muted}>
                  {stop.place}
                </AppText>
              </View>
              {stop.time ? (
                <View style={{ alignItems: "flex-end" }}>
                  <AppText variant="label" weight="bold">
                    {stop.time}
                  </AppText>
                  {stop.date ? (
                    <AppText variant="caption" color={colors.muted}>
                      {stop.date}
                    </AppText>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
