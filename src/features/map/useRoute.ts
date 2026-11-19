import { useQuery } from "@tanstack/react-query";
import type { Coordinates } from "@/types/domain";
import { fetchRoute } from "@/data/routing";

/** ~110 m: o prestador a andar não pede uma rota nova a cada leitura do GPS. */
const round = (value: number) => value.toFixed(3);

/** Rota por estrada entre dois pontos; `undefined` enquanto carrega ou sem pontos. */
export function useRoute(from: Coordinates | undefined, to: Coordinates | undefined) {
  return useQuery({
    queryKey: ["route", from && round(from.latitude), from && round(from.longitude), to && round(to.latitude), to && round(to.longitude)],
    queryFn: () => fetchRoute(from!, to!),
    enabled: !!from && !!to,
    staleTime: 5 * 60_000,
  });
}
