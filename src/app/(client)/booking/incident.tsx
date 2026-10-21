import { View } from "react-native";
import { BatteryWarning, CarFront, Disc3, Fuel, TriangleAlert, Wrench } from "lucide-react-native";
import { IconCircle, ScreenTitle, SelectionCard } from "@/components/kit";
import { BookingScaffold } from "@/components/service/BookingScaffold";
import { incidentOptions } from "@/features/booking/catalog";
import { useBookingStep } from "@/features/booking/useBookingFlow";
import { useBookingStore } from "@/stores/useBookingStore";
import type { IncidentType } from "@/types/domain";
import { colors } from "@/theme/colors";

function IncidentArt({ type }: { type: IncidentType }) {
  const main = { size: 44, color: colors.primary, strokeWidth: 1.8 };
  const badge = (node: React.ReactNode, bg: string = colors.card) => (
    <View style={{ position: "absolute", left: -6, top: -6, width: 30, height: 30, borderRadius: 15, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>{node}</View>
  );
  return (
    <IconCircle size={84}>
      {type === "mechanical" ? <CarFront {...main} /> : null}
      {type === "accident" ? <CarFront {...main} /> : null}
      {type === "flat_tire" ? <Disc3 {...main} color={colors.ink} /> : null}
      {type === "battery" ? <BatteryWarning {...main} color={colors.ink} /> : null}
      {type === "no_fuel" ? <Fuel {...main} /> : null}
      {type === "mechanical" ? badge(<Wrench size={16} color={colors.ink} />) : null}
      {type === "accident" ? badge(<TriangleAlert size={16} color={colors.white} />, colors.danger) : null}
    </IconCircle>
  );
}

/** 13 · Reboque: qual é o problema? */
export default function IncidentStep() {
  const { position, next } = useBookingStep("incident");
  const incident = useBookingStore((s) => s.draft.tow.incident);
  const patchTow = useBookingStore((s) => s.patchTow);
  return (
    <BookingScaffold step={position} onContinue={next} disabled={!incident}>
      <ScreenTitle title="Qual é o problema?" />
      <View accessibilityRole="radiogroup" style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {incidentOptions.map((option) => (
          <SelectionCard
            key={option.value}
            layout="tile"
            title={option.label}
            description={option.hint}
            selected={incident === option.value}
            onPress={() => patchTow({ incident: option.value })}
            style={{ width: "47.5%", minHeight: 176 }}
            media={<IncidentArt type={option.value} />}
          />
        ))}
      </View>
    </BookingScaffold>
  );
}
