import { currentProvider } from "@/mocks/people";
import { useServiceStore } from "@/stores/useServiceStore";
import { isActiveStatus } from "@/features/service/stateMachine";

/** Serviço em curso do prestador autenticado (aceite e ainda não pago), se existir. */
export function useProviderActiveRequest() {
  return useServiceStore((s) =>
    s.requests.find((r) => r.providerId === currentProvider.id && r.status !== "searching" && isActiveStatus(r.status) && r.status !== "delivered"),
  );
}

/** Proposta enviada pelo prestador e ainda sem resposta do cliente. */
export function usePendingProposal() {
  return useServiceStore((s) => s.requests.find((r) => r.providerId === currentProvider.id && r.status === "searching" && r.proposal?.status === "sent"));
}
