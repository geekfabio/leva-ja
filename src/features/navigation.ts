import { router } from "expo-router";
import type { Role } from "@/types/domain";

/** Rotas principais da nova experiência (ver README → Mapa de ecrãs). */
export const homeFor = (role: Role) => (role === "provider" ? "/partner" : "/home");

export function enterApp(role: Role) {
  router.dismissAll?.();
  router.replace(homeFor(role) as never);
}

/** Navega para uma rota calculada (as rotas tipadas só existem depois de `expo start`). */
export const go = (href: string) => router.push(href as never);
export const swap = (href: string) => router.replace(href as never);
