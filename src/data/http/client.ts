import { create, isAxiosError, type InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import { env } from "@/config/env";
import { RepositoryError } from "../repositories/types";

/** Cliente HTTP da API AngoLeva. */
export const http = create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeoutMs,
  headers: { Accept: "application/json", "Accept-Language": "pt-PT", "X-Client": `angoleva-app/${Platform.OS}` },
});

let authToken: string | null = null;

/** Token da sessão actual (vem do login ou da sessão guardada no armazenamento seguro). */
export function setAuthToken(token: string | null) {
  authToken = token;
}

const unauthorizedListeners = new Set<() => void>();

/** Avisa quando a API recusa o token da sessão (expirado ou revogado). */
export function onUnauthorized(listener: () => void) {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

let requestSeq = 0;

http.interceptors.request.use((config) => {
  if (authToken && !config.headers.Authorization) config.headers.Authorization = `Bearer ${authToken}`;
  // Identificador para cruzar os registos da app com os do servidor.
  config.headers["X-Request-Id"] = `${Date.now().toString(36)}-${(++requestSeq).toString(36)}`;
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { retried?: boolean };
const RETRY_DELAY_MS = 600;

// Uma repetição para leituras (GET) que falham por rede ou indisponibilidade temporária.
http.interceptors.response.use(undefined, async (error) => {
  if (!isAxiosError(error) || !error.config) throw error;
  const config = error.config as RetriableConfig;
  const status = error.response?.status;
  const transient = !status || status === 502 || status === 503 || status === 504;
  if (config.method !== "get" || config.retried || !transient || error.code === "ERR_CANCELED") throw error;
  config.retried = true;
  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  return http.request(config);
});

/** Formato de erro da API: `{ "error": { "code": "…", "message": "…" } }` (docs/api.md). */
type ApiErrorBody = { error?: { message?: string }; message?: string };

/** Converte erros HTTP em erros de domínio, com a mesma forma que os mocks devolvem. */
export async function call<T>(request: Promise<{ data: T }>): Promise<T> {
  try {
    return (await request).data;
  } catch (error) {
    throw toRepositoryError(error);
  }
}

export function toRepositoryError(error: unknown): unknown {
  if (!isAxiosError(error)) return error;
  const status = error.response?.status;
  const body = error.response?.data as ApiErrorBody | undefined;
  const message = body?.error?.message ?? body?.message;
  if (!status) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") return new RepositoryError("network", "O servidor demorou demasiado a responder. Tenta de novo.");
    return new RepositoryError("network", "Sem ligação ao servidor. Verifica a internet e tenta de novo.");
  }
  if (status === 401) {
    // Só conta como sessão expirada se o pedido levava token (um login falhado também dá 401).
    if (error.config?.headers?.Authorization) unauthorizedListeners.forEach((listener) => listener());
    return new RepositoryError("unauthorized", message ?? "A sessão expirou. Entra de novo.");
  }
  if (status === 403) return new RepositoryError("forbidden", message ?? "Não tens permissão para esta operação.");
  if (status === 404) return new RepositoryError("not_found", message ?? "Não encontrado.");
  if (status === 409) return new RepositoryError("invalid_transition", message ?? "A operação já não é possível neste estado.");
  if (status === 400 || status === 422) return new RepositoryError("validation", message ?? "Dados inválidos.");
  if (status === 429) return new RepositoryError("server", message ?? "Demasiados pedidos. Aguarda um momento.");
  return new RepositoryError("server", message ?? "O serviço está indisponível. Tenta mais tarde.");
}
