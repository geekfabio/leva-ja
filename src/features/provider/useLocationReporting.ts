import { useEffect } from "react";
import { deviceLocation, repositories } from "@/data";
import { useProviderStore } from "@/stores/useProviderStore";

const REPORT_INTERVAL_MS = 7000;

/**
 * Enquanto o prestador estiver disponível, envia a sua posição GPS ao
 * servidor (`PUT /providers/:id/location`), para o cliente a ver em
 * `request.provider.coords`. Para e limpa o intervalo quando fica indisponível
 * ou o componente desmonta.
 */
export function useLocationReporting() {
  const providerId = useProviderStore((s) => s.providerId);
  const online = useProviderStore((s) => s.online);

  useEffect(() => {
    if (!providerId || !online) return;
    let active = true;
    const report = async () => {
      const coords = await deviceLocation().coords();
      if (active && coords) repositories().providers.updateLocation(providerId, coords).catch(() => undefined);
    };
    report();
    const t = setInterval(report, REPORT_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [providerId, online]);
}
