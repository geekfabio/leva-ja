import { z } from "zod";

const placeSchema = z.object({
  id: z.string(),
  label: z.string(),
  area: z.string(),
  city: z.string(),
  coords: z.object({ latitude: z.number(), longitude: z.number() }),
});

export const incidentSchema = z.object({
  incident: z.enum(["mechanical", "accident", "flat_tire", "battery", "no_fuel"], {
    required_error: "Escolhe o problema da viatura.",
  }),
});

/** Matrícula angolana: LD-12-34-AB. */
export const PLATE_PATTERN = /^[A-Z]{2}-\d{2}-\d{2}-[A-Z]{2}$/;

export const towVehicleSchema = z.object({
  brand: z.string().min(1, "Escolhe a marca."),
  model: z.string().min(1, "Escolhe o modelo."),
  plate: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .pipe(z.string().regex(PLATE_PATTERN, "Usa o formato LD-12-34-AB.")),
  color: z.string().min(1, "Escolhe a cor."),
  canMove: z.boolean({ required_error: "Indica se a viatura se desloca." }),
});

export const cargoSchema = z.object({
  cargoType: z.enum(["boxes", "furniture", "appliances", "construction", "goods", "other"]),
  description: z.string().trim().max(200, "Máximo de 200 caracteres.").default(""),
  weight: z.enum(["upto100", "101to300", "301to500", "over500"]),
  volume: z.enum(["small", "medium", "large"]),
  vehicleClass: z.enum(["tuk_tuk", "pickup", "van", "truck"]),
  helper: z.boolean(),
}).superRefine((value, ctx) => {
  if (value.weight === "over500" && value.vehicleClass === "pickup")
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["vehicleClass"],
      message: "Mais de 500 kg exige carrinha ou camião.",
    });
  if (value.vehicleClass === "tuk_tuk" && (value.weight !== "upto100" || value.volume !== "small"))
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["vehicleClass"],
      message: "O tuk-tuk é indicado para entregas pequenas até 100 kg e 1 m³.",
    });
  if (value.cargoType === "other" && value.description.length < 3)
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["description"],
      message: "Descreve a carga em poucas palavras.",
    });
});

export const movingSchema = z
  .object({
    kind: z.enum(["small_move", "house_move"]),
    propertyType: z.enum(["t0_t1", "t2", "t3", "t4_plus", "office"]).optional(),
    rooms: z.number().int().min(1).max(10),
    items: z.string().trim().min(3, "Indica os itens principais.").max(200),
    helpers: z.number().int().min(0).max(6),
    pickupFloor: z.number().int().min(0, "O piso mínimo é o rés-do-chão.").max(30),
    deliveryFloor: z.number().int().min(0, "O piso mínimo é o rés-do-chão.").max(30),
    elevator: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.kind === "house_move" && !value.propertyType)
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["propertyType"], message: "Escolhe o tipo de imóvel." });
  });

export const scheduleSchema = z
  .object({
    when: z.enum(["now", "scheduled"]),
    date: z.string().optional(),
    time: z.string().optional(),
    disassembly: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.when !== "scheduled") return;
    if (!value.date) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["date"], message: "Escolhe a data." });
    if (!value.time) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["time"], message: "Escolhe a hora." });
  });

export const routeSchema = z
  .object({ origin: placeSchema.nullable(), destination: placeSchema.nullable(), stops: z.array(placeSchema).max(2) })
  .superRefine((value, ctx) => {
    if (!value.origin) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["origin"], message: "Indica o local de recolha." });
    if (!value.destination)
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["destination"], message: "Indica o destino." });
    if (value.origin && value.destination && value.origin.id === value.destination.id)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["destination"],
        message: "O destino tem de ser diferente da recolha.",
      });
  });

export const photosSchema = z.object({
  photos: z.array(z.object({ id: z.string(), asset: z.string(), caption: z.string() })).max(6, "Máximo de 6 fotos."),
  instructions: z.string().max(300, "Máximo de 300 caracteres."),
});

export type TowVehicleForm = z.input<typeof towVehicleSchema>;
export type CargoForm = z.input<typeof cargoSchema>;
export type MovingForm = z.infer<typeof movingSchema>;
export type ScheduleForm = z.infer<typeof scheduleSchema>;
export type PhotosForm = z.infer<typeof photosSchema>;
