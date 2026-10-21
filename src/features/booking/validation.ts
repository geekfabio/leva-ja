import type { BookingDraft } from "@/stores/useBookingStore";
import { cargoSchema, incidentSchema, movingSchema, routeSchema, scheduleSchema, towVehicleSchema } from "./schemas";

/** Valida o rascunho completo com os mesmos esquemas Zod de cada passo. */
export function draftIssues(draft: BookingDraft): string[] {
  const issues: string[] = [];
  const check = (result: { success: boolean; error?: { issues: { message: string }[] } }) => {
    if (!result.success) issues.push(...(result.error?.issues.map((i) => i.message) ?? []));
  };
  if (draft.kind === "tow") {
    check(incidentSchema.safeParse(draft.tow));
    check(towVehicleSchema.safeParse(draft.tow));
  }
  if (draft.kind === "cargo") check(cargoSchema.safeParse(draft.cargo));
  if (draft.kind === "small_move" || draft.kind === "house_move") {
    check(movingSchema.safeParse({ ...draft.moving, kind: draft.kind }));
    check(scheduleSchema.safeParse(draft.moving));
  }
  check(routeSchema.safeParse({ origin: draft.origin, destination: draft.destination, stops: draft.stops }));
  return issues;
}

export const isDraftComplete = (draft: BookingDraft) => draftIssues(draft).length === 0;
