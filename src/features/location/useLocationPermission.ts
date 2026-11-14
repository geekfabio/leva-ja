import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { deviceLocation } from "@/data";
import { useSessionStore } from "@/stores/useSessionStore";

/**
 * Estado real da autorização de localização do dispositivo (não o que o
 * utilizador respondeu no onboarding). Reavalia quando a app volta ao
 * primeiro plano, para apanhar quem activa a localização nas Definições.
 */
export function useLocationPermission() {
  const [granted, setGranted] = useState<boolean | null>(null);

  const check = useCallback(async () => {
    const value = await deviceLocation().hasPermission();
    setGranted(value);
    useSessionStore.getState().setLocationGranted(value);
    return value;
  }, []);

  useEffect(() => {
    check();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => subscription.remove();
  }, [check]);

  const request = useCallback(async () => {
    const value = await deviceLocation().requestPermission();
    setGranted(value);
    useSessionStore.getState().setLocationGranted(value);
    return value;
  }, []);

  return { granted, request };
}
