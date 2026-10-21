import { z } from "zod";

export const proposalSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Indica um valor." })
    .int("Usa um valor inteiro.")
    .min(1000, "O valor mínimo é 1 000 Kz.")
    .max(1_000_000, "Valor demasiado alto."),
  reason: z.string().trim().min(10, "Explica o ajuste em pelo menos 10 caracteres.").max(200),
});

export const proofSchema = z.object({
  photos: z.array(z.object({ id: z.string(), asset: z.string(), caption: z.string() })).min(1, "Adiciona pelo menos uma foto da entrega."),
  signed: z.literal(true, { errorMap: () => ({ message: "Recolhe a assinatura do cliente." }) }),
  signedBy: z.string().trim().min(3, "Indica quem assinou."),
  goodCondition: z.boolean(),
  notes: z.string().max(200).optional(),
}).superRefine((value, ctx) => {
  if (!value.goodCondition && (value.notes ?? "").trim().length < 5)
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["notes"], message: "Descreve o problema na entrega." });
});

export const withdrawSchema = (balance: number) =>
  z.object({
    amount: z
      .number({ invalid_type_error: "Indica um valor." })
      .min(1000, "O levantamento mínimo é 1 000 Kz.")
      .max(balance, "O valor é superior ao saldo disponível."),
    iban: z.string().min(1),
  });

export const vehicleSchema = z.object({
  brand: z.string().trim().min(2, "Indica a marca."),
  model: z.string().trim().min(1, "Indica o modelo."),
  plate: z.string().trim().toUpperCase().regex(/^[A-Z]{2}-\d{2}-\d{2}-[A-Z]{2}$/, "Usa o formato LD-12-34-AB."),
  capacityKg: z.number({ invalid_type_error: "Indica a capacidade." }).min(100).max(30000),
});

export type ProposalForm = z.infer<typeof proposalSchema>;
export type ProofForm = z.infer<typeof proofSchema>;
export type VehicleForm = z.infer<typeof vehicleSchema>;
