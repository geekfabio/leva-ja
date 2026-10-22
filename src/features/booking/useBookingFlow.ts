import { useEffect } from "react";
import { useBookingStore } from "@/stores/useBookingStore";
import { go } from "@/features/navigation";
import type { ServiceKind } from "@/types/domain";
import { bookingSteps, nextStep, stepPosition, type BookingStep } from "./catalog";

/** Começa um pedido novo e abre o primeiro passo do formulário dinâmico. */
export function startBooking(kind: ServiceKind, variant?: "goods") {
  useBookingStore.getState().start(kind, variant);
  go(`/booking/${bookingSteps[kind][0]}`);
}

/** Posição "x de y" do passo actual e navegação para o seguinte, conforme o serviço. */
export function useBookingStep(step: BookingStep) {
  const kind = useBookingStore((s) => s.draft.kind);
  // Ligação directa a um passo de outro serviço (ex.: /booking/incident com rascunho de carga):
  // recomeça o rascunho com um serviço que inclua este passo.
  const valid = bookingSteps[kind].includes(step);
  useEffect(() => {
    if (valid) return;
    const fallback = (Object.keys(bookingSteps) as ServiceKind[]).find((k) => bookingSteps[k].includes(step));
    if (fallback) useBookingStore.getState().start(fallback);
  }, [valid, step]);
  return {
    kind,
    position: stepPosition(kind, step),
    next: () => go(`/booking/${nextStep(kind, step)}`),
  };
}
