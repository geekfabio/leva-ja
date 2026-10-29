import { cargoVehicleOptions, goodsVehicleOptions, suggestVehicle, vehicleForWeight } from "@/features/booking/catalog";
import { estimatePrice, needsProposal, PLATFORM_FEE, providerEarningFor, recommendVehicle } from "@/features/booking/pricing";

describe("estimativa de preço", () => {
  it("reproduz a referência: carga com pickup e ajudante, 18 km = 12 500 Kz", () => {
    const price = estimatePrice({ kind: "cargo", distanceKm: 18, cargo: { weight: "upto100", volume: "small", vehicleClass: "pickup", helper: true } });
    expect(price.total).toBe(12500);
    expect(price.platformFee).toBe(PLATFORM_FEE);
    expect(price.base + price.distance + price.extras + price.platformFee).toBe(price.total);
  });

  it("arredonda a 500 Kz e encarece extras", () => {
    const simple = estimatePrice({ kind: "cargo", distanceKm: 10, cargo: { weight: "upto100", volume: "small", vehicleClass: "pickup", helper: false } });
    const heavy = estimatePrice({ kind: "cargo", distanceKm: 10, cargo: { weight: "over500", volume: "large", vehicleClass: "truck", helper: true } });
    expect(simple.total % 500).toBe(0);
    expect(heavy.total).toBeGreaterThan(simple.total);
  });

  it("cobra escadas apenas sem elevador nas mudanças", () => {
    const base = { kind: "small_move" as const, distanceKm: 12 };
    const withLift = estimatePrice({ ...base, moving: { helpers: 1, pickupFloor: 4, deliveryFloor: 2, elevator: true } });
    const stairs = estimatePrice({ ...base, moving: { helpers: 1, pickupFloor: 4, deliveryFloor: 2, elevator: false } });
    expect(stairs.total - withLift.total).toBe(3000);
  });

  it("calcula o ganho do prestador após comissão e taxa", () => {
    const price = estimatePrice({ kind: "tow", distanceKm: 17, tow: { canMove: false, incident: "mechanical" } });
    const earning = providerEarningFor(price);
    expect(earning).toBeLessThan(price.total - price.platformFee);
    expect(earning % 500).toBe(0);
  });

  it("recomenda a viatura e indica quando há proposta", () => {
    expect(recommendVehicle({ kind: "tow", distanceKm: 5 }).art).toBe("tow");
    expect(recommendVehicle({ kind: "cargo", distanceKm: 5, cargo: { vehicleClass: "pickup", helper: true } }).title).toBe("Pickup com ajudante");
    expect(needsProposal("house_move")).toBe(true);
    expect(needsProposal("cargo")).toBe(false);
  });

  it("recomenda tuk-tuk e preço mais leve para entregas pequenas", () => {
    const tukTuk = estimatePrice({ kind: "cargo", distanceKm: 5, cargo: { weight: "upto100", volume: "small", vehicleClass: "tuk_tuk", helper: false } });
    const pickup = estimatePrice({ kind: "cargo", distanceKm: 5, cargo: { weight: "upto100", volume: "small", vehicleClass: "pickup", helper: false } });
    expect(recommendVehicle({ kind: "cargo", distanceKm: 5, cargo: { vehicleClass: "tuk_tuk" } }).art).toBe("tuk_tuk");
    expect(tukTuk.total).toBeLessThan(pickup.total);
  });
});

describe("viatura sugerida pelo peso da carga", () => {
  const maxOfRange = { upto100: 100, "101to300": 300, "301to500": 500, over500: 501 } as const;

  it("escolhe pickup até 300 kg, carrinha de 301 a 500 kg e camião acima", () => {
    expect(vehicleForWeight).toEqual({ upto100: "pickup", "101to300": "pickup", "301to500": "van", over500: "truck" });
  });

  it("a viatura sugerida aguenta sempre o peso máximo da faixa", () => {
    for (const [range, kg] of Object.entries(maxOfRange)) {
      const vehicle = cargoVehicleOptions.find((v) => v.value === vehicleForWeight[range as keyof typeof maxOfRange])!;
      expect(vehicle.maxKg).toBeGreaterThanOrEqual(kg);
    }
  });
});

describe("entrega de mercadoria: tuk-tuk para cargas pequenas", () => {
  it("sugere tuk-tuk até 100 kg e volume pequeno; acima disso, pela regra do peso sem camião", () => {
    expect(suggestVehicle("goods", "upto100", "small")).toBe("tuk_tuk");
    expect(suggestVehicle("goods", "upto100", "medium")).toBe("pickup");
    expect(suggestVehicle("goods", "101to300", "small")).toBe("pickup");
    expect(suggestVehicle("goods", "301to500", "small")).toBe("van");
    expect(suggestVehicle("goods", "over500", "large")).toBe("van");
    // Transporte de carga normal não tem tuk-tuk.
    expect(suggestVehicle(undefined, "upto100", "small")).toBe("pickup");
  });

  it("todas as sugestões existem nas opções da variante", () => {
    for (const weight of ["upto100", "101to300", "301to500", "over500"] as const)
      for (const volume of ["small", "medium", "large"] as const) {
        expect(goodsVehicleOptions.map((o) => o.value)).toContain(suggestVehicle("goods", weight, volume));
        expect(cargoVehicleOptions.map((o) => o.value)).toContain(suggestVehicle(undefined, weight, volume));
      }
  });
});
