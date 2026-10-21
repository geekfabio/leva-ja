import { formatFloor, formatKz, formatNumber, formatSignedKz, initialsOf, maskPhone, parseAmount } from "@/utils/format";
import { dayGroupLabel } from "@/utils/date";
import { mockRoute, pointAlong } from "@/utils/geo";
import { places, roadDistanceKm } from "@/mocks/places";

describe("formatação pt-PT", () => {
  it("valores em kwanzas com espaço de milhares", () => {
    expect(formatNumber(12500)).toBe("12 500");
    expect(formatKz(1000000)).toBe("1 000 000 Kz");
    expect(formatSignedKz(10000)).toBe("+10 000 Kz");
    expect(formatSignedKz(-25000)).toBe("-25 000 Kz");
    expect(parseAmount("28 500 Kz")).toBe(28500);
  });

  it("textos auxiliares", () => {
    expect(initialsOf("João Manuel")).toBe("JM");
    expect(maskPhone("923456789")).toBe("923 456 789");
    expect(formatFloor(0)).toBe("Rés-do-chão");
    expect(formatFloor(3)).toBe("3.º andar");
  });

  it("agrupa datas por Hoje/Ontem", () => {
    const now = new Date(2026, 9, 21, 12);
    expect(dayGroupLabel(new Date(2026, 9, 21, 9).toISOString(), now)).toBe("Hoje, 21 de Outubro de 2026");
    expect(dayGroupLabel(new Date(2026, 9, 20, 9).toISOString(), now)).toBe("Ontem, 20 de Outubro de 2026");
    expect(dayGroupLabel(new Date(2026, 2, 12, 9).toISOString(), now)).toBe("12 de Março de 2026");
  });

  it("trajecto simulado começa e acaba nos pontos certos", () => {
    const route = mockRoute(places.ingombota.coords, places.talatona.coords);
    expect(route[0]).toEqual(places.ingombota.coords);
    expect(pointAlong(route, 1).latitude).toBeCloseTo(places.talatona.coords.latitude, 6);
    expect(roadDistanceKm(places.ingombota, places.talatona)).toBeGreaterThan(10);
  });
});
