import { fallbackRoutePlan } from "@/services/routing";

describe("routing fallback", () => {
  it("produz geometria, distância e duração quando o OSRM não está disponível", () => {
    const from = { latitude: -8.8147, longitude: 13.2302 };
    const to = { latitude: -8.918, longitude: 13.183 };
    const route = fallbackRoutePlan([from, to]);

    expect(route.source).toBe("mock");
    expect(route.coordinates[0]).toEqual(from);
    expect(route.coordinates.at(-1)).toEqual(to);
    expect(route.distanceKm).toBeGreaterThan(0);
    expect(route.durationMin).toBeGreaterThan(0);
  });

  it("mantém uma paragem intermédia na geometria", () => {
    const from = { latitude: -8.8147, longitude: 13.2302 };
    const stop = { latitude: -8.85, longitude: 13.208 };
    const to = { latitude: -8.918, longitude: 13.183 };
    const route = fallbackRoutePlan([from, stop, to]);

    expect(route.coordinates).toContainEqual(stop);
    expect(route.coordinates.at(-1)).toEqual(to);
  });
});
