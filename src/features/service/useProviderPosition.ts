import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import type { Coordinates } from "@/types/domain";

const TWEEN_MS = 3200;

/**
 * Anima suavemente o marcador do prestador entre leituras sucessivas da sua
 * posição real (`request.provider.coords`, actualizada a cada poll), em vez
 * de saltar instantaneamente de um ponto para o outro.
 */
export function useAnimatedProviderPosition(coords: Coordinates | undefined): Coordinates | undefined {
  const anim = useRef(new Animated.ValueXY({ x: coords?.longitude ?? 0, y: coords?.latitude ?? 0 })).current;
  const last = useRef<Coordinates | undefined>(coords);
  const [position, setPosition] = useState<Coordinates | undefined>(coords);

  useEffect(() => {
    const id = anim.addListener(({ x, y }) => setPosition({ latitude: y, longitude: x }));
    return () => anim.removeListener(id);
  }, [anim]);

  useEffect(() => {
    if (!coords) return;
    if (!last.current) {
      anim.setValue({ x: coords.longitude, y: coords.latitude });
    } else if (last.current.latitude !== coords.latitude || last.current.longitude !== coords.longitude) {
      Animated.timing(anim, { toValue: { x: coords.longitude, y: coords.latitude }, duration: TWEEN_MS, useNativeDriver: false }).start();
    }
    last.current = coords;
  }, [anim, coords?.latitude, coords?.longitude]);

  return position ?? coords;
}
