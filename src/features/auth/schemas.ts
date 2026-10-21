import { z } from "zod";

const email = z.string().trim().min(1, "Indica o teu email.").email("Email inválido.");

export const loginSchema = z.object({
  email,
  password: z.string().min(6, "A palavra-passe tem pelo menos 6 caracteres."),
});

/** Telemóvel angolano sem indicativo: 9 dígitos a começar por 9. */
export const AO_PHONE = /^9\d{8}$/;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Indica o teu nome completo.")
    .refine((value) => value.split(/\s+/).length >= 2, "Indica o nome e o apelido."),
  email,
  phone: z
    .string()
    .transform((value) => value.replace(/\s/g, ""))
    .pipe(z.string().regex(AO_PHONE, "Número inválido. Ex.: 923 456 789")),
});

export const registerSecuritySchema = z
  .object({
    password: z
      .string()
      .min(8, "Usa pelo menos 8 caracteres.")
      .regex(/\d/, "Inclui pelo menos um número."),
    confirm: z.string(),
    terms: z.literal(true, { errorMap: () => ({ message: "Aceita os termos para continuar." }) }),
  })
  .refine((value) => value.password === value.confirm, {
    path: ["confirm"],
    message: "As palavras-passe não coincidem.",
  });

export const recoverSchema = z.object({ email });

export const otpSchema = z.object({ code: z.string().regex(/^\d{6}$/, "Introduz os 6 dígitos.") });

/** Código aceite pelos mocks de verificação. */
export const DEMO_OTP = "123456";

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.input<typeof registerSchema>;
export type RegisterSecurityForm = z.input<typeof registerSecuritySchema>;
