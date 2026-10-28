import { z } from "zod";

/**
 * Configuração da app a partir das variáveis `EXPO_PUBLIC_*` (ver `.env.example`).
 * O Expo só substitui `process.env.EXPO_PUBLIC_X` quando o nome aparece por
 * extenso, por isso cada variável é lida explicitamente.
 */
const schema = z
  .object({
    dataSource: z.enum(["mock", "http"]).default("mock"),
    apiUrl: z.string().url("EXPO_PUBLIC_API_URL tem de ser um URL (ex.: https://api.angoleva.ao/v1).").optional(),
    apiTimeoutMs: z.coerce.number().int().positive().default(10_000),
    pollIntervalMs: z.coerce.number().int().min(1_000).default(5_000),
    /** WebSocket do tempo real (ex.: wss://api.angoleva.ao/v1/realtime). Sem ele, a app usa polling. */
    realtimeUrl: z.string().url("EXPO_PUBLIC_REALTIME_URL tem de ser um URL ws:// ou wss://.").optional(),
    secureStorage: z.enum(["mock", "device"]).default("mock"),
    /** GPS: `simulated` (ponto em Luanda) ou `device`. Por omissão, simulado com dados mock e real com a API. */
    location: z.enum(["simulated", "device"]).optional(),
    /** Fotografias: `simulated` (fotos de exemplo) ou `device` (câmara/galeria + envio). Mesma regra por omissão. */
    camera: z.enum(["simulated", "device"]).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.dataSource === "http" && !value.apiUrl) {
      ctx.addIssue({ code: "custom", path: ["apiUrl"], message: "EXPO_PUBLIC_DATA_SOURCE=http exige EXPO_PUBLIC_API_URL." });
    }
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
  dataSource: process.env.EXPO_PUBLIC_DATA_SOURCE,
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
  apiTimeoutMs: process.env.EXPO_PUBLIC_API_TIMEOUT_MS,
  pollIntervalMs: process.env.EXPO_PUBLIC_POLL_INTERVAL_MS,
  realtimeUrl: process.env.EXPO_PUBLIC_REALTIME_URL,
  secureStorage: process.env.EXPO_PUBLIC_SECURE_STORAGE,
  location: process.env.EXPO_PUBLIC_LOCATION,
  camera: process.env.EXPO_PUBLIC_CAMERA,
});

/** Origem da posição do utilizador. */
export const locationSource = env.location ?? (env.dataSource === "http" ? "device" : "simulated");

/** Origem das fotografias. */
export const cameraSource = env.camera ?? (env.dataSource === "http" ? "device" : "simulated");
