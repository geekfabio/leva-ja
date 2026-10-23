import { cargoSchema, movingSchema, routeSchema, scheduleSchema, towVehicleSchema } from "@/features/booking/schemas";
import { loginSchema, registerSchema, registerSecuritySchema } from "@/features/auth/schemas";
import { proofSchema, proposalSchema, withdrawSchema } from "@/features/provider/schemas";
import { places } from "@/mocks/places";

const messages = (r: { success: boolean; error?: { issues: { message: string }[] } }) => r.error?.issues.map((i) => i.message) ?? [];

describe("validação Zod", () => {
  it("acesso e registo", () => {
    expect(loginSchema.safeParse({ email: "x", password: "123" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.ao", password: "123456" }).success).toBe(true);
    expect(registerSchema.safeParse({ name: "Ana", email: "a@b.ao", phone: "923456789" }).success).toBe(false);
    expect(registerSchema.safeParse({ name: "Ana Neto", email: "a@b.ao", phone: "923 456 789" }).success).toBe(true);
    expect(messages(registerSecuritySchema.safeParse({ password: "abcdefgh1", confirm: "x", terms: true }))).toContain("As palavras-passe não coincidem.");
  });

  it("dados da viatura com matrícula angolana", () => {
    const ok = towVehicleSchema.safeParse({ brand: "Toyota", model: "Hilux", plate: "ld-12-34-ab", color: "Branco", canMove: false });
    expect(ok.success && ok.data.plate).toBe("LD-12-34-AB");
    expect(messages(towVehicleSchema.safeParse({ brand: "Toyota", model: "Hilux", plate: "1234", color: "Branco", canMove: true }))).toContain("Usa o formato LD-12-34-AB.");
  });

  it("carga: pickup não leva mais de 500 kg e 'outro' exige descrição", () => {
    const base = { cargoType: "boxes", description: "", weight: "over500", volume: "large", vehicleClass: "pickup", helper: false } as const;
    expect(messages(cargoSchema.safeParse(base))).toContain("Mais de 500 kg exige carrinha ou camião.");
    expect(cargoSchema.safeParse({ ...base, vehicleClass: "truck" }).success).toBe(true);
    expect(cargoSchema.safeParse({ ...base, vehicleClass: "truck", cargoType: "other" }).success).toBe(false);
  });

  it("tuk-tuk é reservado a pequenas entregas", () => {
    const delivery = { cargoType: "goods", description: "Encomenda para loja", weight: "upto100", volume: "small", vehicleClass: "tuk_tuk", helper: false } as const;
    expect(cargoSchema.safeParse(delivery).success).toBe(true);
    expect(messages(cargoSchema.safeParse({ ...delivery, weight: "101to300" }))).toContain("O tuk-tuk é indicado para entregas pequenas até 100 kg e 1 m³.");
  });

  it("mudança de casa exige tipo de imóvel; agenda exige data e hora", () => {
    const moving = { kind: "house_move", rooms: 2, items: "Sofá e camas", helpers: 2, pickupFloor: 1, deliveryFloor: 0, elevator: true } as const;
    expect(movingSchema.safeParse(moving).success).toBe(false);
    expect(movingSchema.safeParse({ ...moving, propertyType: "t2" }).success).toBe(true);
    expect(scheduleSchema.safeParse({ when: "scheduled", disassembly: false }).success).toBe(false);
    expect(scheduleSchema.safeParse({ when: "now", disassembly: false }).success).toBe(true);
  });

  it("trajecto precisa de origem e destino diferentes", () => {
    expect(routeSchema.safeParse({ origin: places.ingombota, destination: places.ingombota, stops: [] }).success).toBe(false);
    expect(routeSchema.safeParse({ origin: places.ingombota, destination: places.talatona, stops: [] }).success).toBe(true);
  });

  it("prestador: proposta, comprovativo e levantamento", () => {
    expect(proposalSchema.safeParse({ amount: 500, reason: "curto" }).success).toBe(false);
    expect(proposalSchema.safeParse({ amount: 28500, reason: "Inclui 2 ajudantes e 3.º andar" }).success).toBe(true);
    const photo = { id: "1", asset: "delivered-sofa", caption: "Sofá" };
    expect(proofSchema.safeParse({ photos: [photo], signed: false, signedBy: "Carlos", goodCondition: true }).success).toBe(false);
    expect(proofSchema.safeParse({ photos: [photo], signed: true, signedBy: "Carlos", goodCondition: false, notes: "" }).success).toBe(false);
    expect(proofSchema.safeParse({ photos: [photo], signed: true, signedBy: "Carlos", goodCondition: true }).success).toBe(true);
    expect(withdrawSchema(45000).safeParse({ amount: 50000, iban: "AO06" }).success).toBe(false);
    expect(withdrawSchema(45000).safeParse({ amount: 45000, iban: "AO06" }).success).toBe(true);
  });
});
