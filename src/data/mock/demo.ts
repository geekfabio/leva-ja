import { currentClient, currentProvider } from "@/mocks/people";
import { clone } from "./runtime";

/** Identidades de demonstração usadas antes de qualquer login (ligações directas, testes). */
export const DEMO_CLIENT = clone(currentClient);
export const DEMO_PROVIDER_ID = currentProvider.id;

/** Token da sessão de demonstração, aceite pela API simulada desde o arranque. */
export const DEMO_TOKEN = "demo-session-token";
