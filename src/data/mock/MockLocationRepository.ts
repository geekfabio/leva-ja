import type { Coordinates } from "@/types/domain";
import * as Location from "expo-location";
import { placeList, places, roadDistanceKm, userLocation } from "@/mocks/places";
import type { LocationRepository, NearbyVehicle } from "../repositories/LocationRepository";
import { clone, simulate } from "./runtime";

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** GPS e geocodificação simulados sobre bairros de Luanda. */
export class MockLocationRepository implements LocationRepository {
  async currentLocation() {
    if (process.env.NODE_ENV === "test") return simulate(() => clone(userLocation), 0);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") return clone(userLocation);
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      return {
        id: "device-location",
        label: "Minha localização actual",
        area: "Localização GPS",
        city: "Angola",
        coords: { latitude: position.coords.latitude, longitude: position.coords.longitude },
      };
    } catch {
      // A demonstração continua funcional em simuladores, web ou sem sinal GPS.
      return clone(userLocation);
    }
  }

  search(query: string) {
    return simulate(() => {
      const q = normalize(query.trim());
      return clone(placeList.filter((p) => !q || normalize(`${p.label} ${p.area}`).includes(q)));
    }, 250);
  }

  areas() {
    return simulate(() => clone(placeList), 0);
  }

  nearbyVehicles(_around: Coordinates) {
    return simulate<NearbyVehicle[]>(() => [
      { id: "veh-1", coords: places.maculusso.coords, kind: "cargo" },
      { id: "veh-2", coords: places.rangel.coords, kind: "tow" },
    ]);
  }

  distanceKm = roadDistanceKm;
}
