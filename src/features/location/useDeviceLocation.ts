import { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";
import type { Coordinates, Place } from "@/types/domain";

export function placeFromCoordinates(coords: Coordinates, label = "Ponto seleccionado no mapa"): Place {
  const latitude = Number(coords.latitude.toFixed(6));
  const longitude = Number(coords.longitude.toFixed(6));
  return {
    id: "coordinate-" + latitude + "-" + longitude,
    label,
    area: latitude.toFixed(4) + ", " + longitude.toFixed(4),
    city: "Angola",
    coords: { latitude, longitude },
  };
}

/** Posição real do equipamento. Não bloqueia o fluxo se a permissão for recusada. */
export function useDeviceLocation() {
  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<Place | null> => {
    setLoading(true);
    setError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setError("Permissão de localização não concedida.");
        return null;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const nextPlace = placeFromCoordinates(
        { latitude: position.coords.latitude, longitude: position.coords.longitude },
        "A minha localização",
      );
      setPlace(nextPlace);
      return nextPlace;
    } catch {
      setError("Não foi possível obter a localização actual.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { place, isLoading, error, refresh };
}
