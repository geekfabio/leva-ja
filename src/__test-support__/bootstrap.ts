import { createApiRepositories } from "@/data/api/ApiRepositories";
import { WebSocketRealtime } from "@/data/api/WebSocketRealtime";
import { getAuthToken, http, setAuthToken } from "@/data/http/client";
import { notifyRealtimeReconnect, setDeviceLocation, setDeviceNotifications, setRepositories } from "@/data";
import { useSessionStore } from "@/stores/useSessionStore";
import { DEMO_CLIENT, DEMO_PROVIDER_ID, DEMO_TOKEN } from "./mock/demo";
import { SimulatedDeviceLocation, SimulatedDeviceNotifications } from "./mock/device";
import { MockMediaRepository } from "./mock/MockMediaRepository";
import type { RequestRepository } from "@/data/repositories/RequestRepository";
import { autoAdvanceSteps } from "./mock/autoAdvance";
import { createMockServer } from "./mock/server";

/** Prestador simulado do e2e: cada pedido avança sozinho pelos estados seguintes (ver autoAdvance.ts). */
function startAutoAdvance(requests: RequestRepository) {
  // Só os pedidos criados nesta sessão (o primeiro evento é "a procurar"); os de demonstração conduzem-se à mão.
  const created = new Set<string>();
  requests.subscribe((request) => {
    // Cliente simulado: depois de o prestador registar as fotos da carga, confirma a recolha.
    if (request.status === "arrived" && request.pickupPhotos.length > 0) {
      setTimeout(() => void requests.transition(request.id, "pickup_confirmed", "system").catch(() => undefined), 1500);
    }
    if (request.status === "searching") created.add(request.id);
    const step = autoAdvanceSteps[request.status];
    if (!step || !created.has(request.id)) return;
    setTimeout(async () => {
      const current = await requests.get(request.id).catch(() => undefined);
      if (current?.status === request.status) await requests.transition(request.id, step.to, "system").catch(() => undefined);
    }, step.afterMs);
  });
}

/**
 * Liga a app a um servidor falso em memória, com a sessão do cliente de
 * demonstração já aberta. Só os testes (Jest e e2e com EXPO_PUBLIC_E2E=1) o
 * chamam; o build de produção nunca inclui esta pasta (ver metro.config.js).
 */
export function installTestBackend({ autoAdvance = false }: { autoAdvance?: boolean } = {}) {
  const server = createMockServer();
  http.defaults.adapter = server.adapter;

  const location = new SimulatedDeviceLocation();
  setDeviceLocation(location);
  setDeviceNotifications(new SimulatedDeviceNotifications(server.pushGateway));

  const realtime = new WebSocketRealtime({ url: "mock://realtime", token: getAuthToken, createSocket: server.connect, onReconnect: notifyRealtimeReconnect });
  setRepositories(createApiRepositories({ realtime, location, media: new MockMediaRepository() }));

  if (autoAdvance) startAutoAdvance(server.repositories.requests);

  setAuthToken(DEMO_TOKEN);
  useSessionStore.setState({ token: DEMO_TOKEN, user: DEMO_CLIENT, providerId: DEMO_PROVIDER_ID });
}
