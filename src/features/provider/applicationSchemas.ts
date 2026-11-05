import { z } from "zod";
import { AO_PHONE } from "@/features/auth/schemas";

export const applicantSchema = z.object({
  name: z.string().trim().min(3, "Indica o teu nome completo."),
  email: z.string().trim().min(1, "Indica o teu email.").email("Email inválido."),
  phone: z
    .string()
    .transform((value) => value.replace(/\s/g, ""))
    .pipe(z.string().regex(AO_PHONE, "Número inválido. Ex.: 923 456 789")),
});

export const serviceKindValues = ["tow", "cargo", "small_move", "house_move"] as const;

export const applicationCoverageSchema = z.object({
  serviceTypes: z.array(z.enum(serviceKindValues)).min(1, "Escolhe pelo menos um serviço."),
  zoneIds: z.array(z.string()).min(1, "Escolhe pelo menos uma zona."),
});

export const vehicleClassOptions = [
  { value: "tow_truck", label: "Reboque" },
  { value: "tuk_tuk", label: "Tuk-tuk" },
  { value: "pickup", label: "Pickup" },
  { value: "van", label: "Carrinha" },
  { value: "truck", label: "Camião" },
] as const;

export const applicationVehicleSchema = z.object({
  brand: z.string().trim().min(2, "Indica a marca."),
  model: z.string().trim().min(1, "Indica o modelo."),
  plate: z.string().trim().toUpperCase().regex(/^[A-Z]{2}-\d{2}-\d{2}-[A-Z]{2}$/, "Usa o formato LD-12-34-AB."),
  color: z.string().trim().min(2, "Indica a cor."),
  class: z.enum(["tow_truck", "tuk_tuk", "pickup", "van", "truck"]),
  categoryLabel: z.string().trim().min(2, "Indica a categoria da viatura."),
  capacityKg: z.number().min(100).max(30000).optional(),
  year: z
    .number()
    .int()
    .min(1990)
    .max(new Date().getFullYear() + 1)
    .optional(),
});

export type ApplicantForm = z.input<typeof applicantSchema>;
export type ApplicationCoverageForm = z.infer<typeof applicationCoverageSchema>;
export type ApplicationVehicleForm = z.input<typeof applicationVehicleSchema>;
