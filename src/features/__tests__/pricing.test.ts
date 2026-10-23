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
