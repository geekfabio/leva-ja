import type { Coordinates } from "@/types/domain";
import { userLocation } from "@/mocks/places";
import type { DeviceLocation } from "../device/DeviceLocation";
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
