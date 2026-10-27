import { create, isAxiosError } from "axios";
import { RepositoryError } from "../repositories/types";

/** Cliente HTTP da API AngoLeva. */
export const http = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "https://api.angoleva.ao",
  timeout: 10_000,
});

let authToken: string | null = null;

/** Token da sessão actual (vem do login ou da sessão guardada no armazenamento seguro). */
export function setAuthToken(token: string | null) {
  authToken = token;
}

http.interceptors.request.use((config) => {
  if (authToken && !config.headers.Authorization) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

/** Converte erros HTTP em erros de domínio, com a mesma forma que os mocks devolvem. */
export async function call<T>(request: Promise<{ data: T }>): Promise<T> {
  try {
    return (await request).data;
  } catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status;
      const message = (error.response?.data as { message?: string } | undefined)?.message ?? error.message;
      if (!status) throw new RepositoryError("network", "Sem ligação ao servidor.");
      if (status === 401) throw new RepositoryError("unauthorized", message);
      if (status === 403) throw new RepositoryError("forbidden", message);
      if (status === 404) throw new RepositoryError("not_found", message);
      if (status === 409) throw new RepositoryError("invalid_transition", message);
      if (status === 422 || status === 400) throw new RepositoryError("validation", message);
    }
    throw error;
  }
}
