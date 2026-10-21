import { currentClient, currentProvider } from "@/mocks/people";
import { clone } from "./runtime";

/** Identidades de demonstração usadas antes de qualquer login (ligações directas, /demo). */
export const DEMO_CLIENT = clone(currentClient);
export const DEMO_PROVIDER_ID = currentProvider.id;
