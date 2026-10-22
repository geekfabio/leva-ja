import type { Coordinates } from "@/types/domain";
import { placeList, places, roadDistanceKm, userLocation } from "@/mocks/places";
import type { LocationRepository, NearbyVehicle } from "../repositories/LocationRepository";
import { clone, simulate } from "./runtime";

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** GPS e geocodificação simulados sobre bairros de Luanda. */
export class MockLocationRepository implements LocationRepository {
  currentLocation() {
    return simulate(() => clone(userLocation), 0);
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
