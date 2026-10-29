import type { Coordinates } from "@/types/domain";
import { userLocation } from "@/mocks/places";
import type { DeviceLocation } from "../device/DeviceLocation";
import type { DeviceNotifications, PushMessage } from "../device/DeviceNotifications";
import type { Unsubscribe } from "../repositories/types";
import { simulate } from "./runtime";

/**
 * GPS simulado para a demonstração: a "posição" é um ponto em Luanda, onde
 * estão os dados de demonstração. A autorização funciona como a real
 * (começa por decidir, pode ser concedida ou recusada).
 */
export class SimulatedDeviceLocation implements DeviceLocation {
  private granted: boolean | null = null;

  constructor(
    private readonly position: Coordinates = userLocation.coords,
    private readonly answer: boolean = true,
  ) {}

  async hasPermission() {
    return this.granted === true;
  }

  requestPermission() {
    return simulate(() => {
      this.granted = this.answer;
      return this.granted;
    }, 600);
  }

  async coords() {
    return this.granted ? { ...this.position } : null;
  }
}

type PushGateway = { subscribe(token: string, handler: (message: PushMessage) => void): Unsubscribe };

/**
 * Push simulado: o dispositivo recebe um token e as mensagens chegam pelo
 * serviço de entrega da API simulada, como chegariam pelo Expo Push.
 */
export class SimulatedDeviceNotifications implements DeviceNotifications {
  private readonly token = `sim-push-${Math.random().toString(36).slice(2, 12)}`;

  constructor(private readonly gateway: PushGateway) {}

  async requestPermission() {
    return true;
  }

  async pushToken() {
    return this.token;
  }

  onMessage(listener: (message: PushMessage) => void) {
    return this.gateway.subscribe(this.token, listener);
  }

  onOpen(): Unsubscribe {
    return () => undefined;
  }
}
