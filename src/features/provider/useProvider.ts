import type { Provider, Vehicle } from "@/types/domain";
import { useProviderStore } from "@/stores/useProviderStore";

/**
 * Prestador autenticado. O layout `(provider)` só mostra os ecrãs depois de o
 * estado ser carregado do ProviderRepository, por isso aqui nunca é nulo.
 */
export function useMyProvider(): Provider {
  const profile = useProviderStore((s) => s.profile);
  if (!profile) throw new Error("useMyProvider usado antes de carregar o prestador.");
  return profile;
}

export function useMyVehicle(): Vehicle {
  return useMyProvider().vehicle;
}
