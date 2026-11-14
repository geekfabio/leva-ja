import { useSessionStore } from "@/stores/useSessionStore";
import { useServiceStore } from "@/stores/useServiceStore";
import { isActiveStatus } from "@/features/service/stateMachine";

/** Serviço em curso do prestador autenticado (aceite e ainda não pago), se existir. */
export function useProviderActiveRequest() {
  const providerId = useSessionStore((s) => s.providerId);
  return useServiceStore((s) =>
    s.requests.find((r) => r.providerId === providerId && r.status !== "searching" && isActiveStatus(r.status) && r.status !== "delivered"),
  );
}
