import { z } from "zod";

/**
 * Configuração da app a partir das variáveis `EXPO_PUBLIC_*` (ver `.env.example`).
 * O Expo só substitui `process.env.EXPO_PUBLIC_X` quando o nome aparece por
 * extenso, por isso cada variável é lida explicitamente.
 */
const schema = z
  .object({
    apiUrl: z
      .string({ required_error: "EXPO_PUBLIC_API_URL é obrigatório: é o endereço da API (ex.: https://api.angoleva.ao)." })
      .url("EXPO_PUBLIC_API_URL tem de ser um URL (ex.: https://api.angoleva.ao)."),
    apiTimeoutMs: z.coerce.number().int().positive().default(10_000),
    pollIntervalMs: z.coerce.number().int().min(1_000).default(5_000),
    /** WebSocket do tempo real (ex.: wss://api.angoleva.ao/v1/realtime). Sem ele, a app usa polling. */
    realtimeUrl: z.string().url("EXPO_PUBLIC_REALTIME_URL tem de ser um URL ws:// ou wss://.").optional(),
    /** Mapa: servidor de tiles OpenStreetMap e de rotas OSRM. Os públicos são só para desenvolvimento. */
    mapTilesUrl: z.string().default("https://tile.openstreetmap.org/{z}/{x}/{y}.png"),
    routingUrl: z.string().url().default("https://router.project-osrm.org"),
  });

export type AppEnv = z.infer<typeof schema>;

const blank = (value: string | undefined) => (value === "" ? undefined : value);

export function parseEnv(raw: Partial<Record<keyof AppEnv, string | undefined>>): AppEnv {
  const result = schema.safeParse(Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, blank(v)])));
  if (!result.success) {
    const details = result.error.issues.map((issue) => `- ${issue.path.join(".")}: ${issue.message}`).join("\n");
    throw new Error(`Configuração inválida (.env):\n${details}`);
  }
  return result.data;
}

export const env = parseEnv({
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
  apiTimeoutMs: process.env.EXPO_PUBLIC_API_TIMEOUT_MS,
  pollIntervalMs: process.env.EXPO_PUBLIC_POLL_INTERVAL_MS,
  realtimeUrl: process.env.EXPO_PUBLIC_REALTIME_URL,
  mapTilesUrl: process.env.EXPO_PUBLIC_MAP_TILES_URL,
  routingUrl: process.env.EXPO_PUBLIC_ROUTING_URL,
});
