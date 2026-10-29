import * as Location from "expo-location";
import type { Coordinates } from "@/types/domain";

/**
 * GPS do dispositivo. É separado dos repositórios: a posição vem do telemóvel,
 * a morada correspondente vem da API (`GET /locations/reverse`).
 */
export interface DeviceLocation {
  /** Já existe autorização? (não pergunta nada ao utilizador) */
  hasPermission(): Promise<boolean>;
  /** Pede autorização ao sistema; `true` se foi concedida. */
  requestPermission(): Promise<boolean>;
  /** Posição actual, ou `null` sem autorização, sem sinal ou após o tempo limite. */
  coords(): Promise<Coordinates | null>;
}

const TIMEOUT_MS = 8000;

const withTimeout = <T>(promise: Promise<T>, ms: number) =>
  Promise.race([promise, new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))]);

/** Implementação real sobre o expo-location (Android, iOS e web via navigator.geolocation). */
export class ExpoDeviceLocation implements DeviceLocation {
  async hasPermission() {
    try {
      return (await Location.getForegroundPermissionsAsync()).granted;
    } catch {
      return false;
    }
  }

  async requestPermission() {
    try {
      return (await Location.requestForegroundPermissionsAsync()).granted;
    } catch {
      return false;
    }
  }

  async coords() {
    try {
      if (!(await this.hasPermission())) return null;
      const position =
        (await withTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), TIMEOUT_MS)) ??
        (await Location.getLastKnownPositionAsync());
      return position ? { latitude: position.coords.latitude, longitude: position.coords.longitude } : null;
    } catch {
      return null;
    }
  }
}
