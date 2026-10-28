import { createApiRepositories } from "@/data/api/ApiRepositories";
import { http } from "@/data/http/client";
import { SimulatedDeviceLocation } from "@/data/mock/device";
import { MockDatabase } from "@/data/mock/database";
import { createMockServer } from "@/data/mock/server";
import { places, userLocation } from "@/mocks/places";

jest.mock("expo-location", () => ({
  Accuracy: { Balanced: 3 },
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
}));

async function api(location?: SimulatedDeviceLocation) {
  http.defaults.adapter = createMockServer(new MockDatabase()).adapter;
  const repos = createApiRepositories({ location });
  await repos.auth.login("armando@email.com", "segredo12", "client");
  return repos;
}

describe("localização: GPS do dispositivo + morada da API", () => {
  it("sem autorização, usa a posição aproximada da API", async () => {
    const repos = await api(new SimulatedDeviceLocation(places.talatona.coords));
    expect((await repos.locations.currentLocation()).id).toBe(userLocation.id);
  });

  it("com autorização, a posição vem do GPS e a morada da API (GET /locations/reverse)", async () => {
    const gps = new SimulatedDeviceLocation(places.talatona.coords);
    const repos = await api(gps);
    expect(await gps.requestPermission()).toBe(true);
    const here = await repos.locations.currentLocation();
    expect(here.area).toBe("Talatona");
    expect(here.coords).toEqual(places.talatona.coords);
  });

  it("recusar a autorização mantém a posição aproximada", async () => {
    const gps = new SimulatedDeviceLocation(places.talatona.coords, false);
    const repos = await api(gps);
    expect(await gps.requestPermission()).toBe(false);
    expect((await repos.locations.currentLocation()).id).toBe(userLocation.id);
  });

  it("geocodificação inversa devolve o bairro mais próximo", async () => {
    const repos = await api();
    const near = await repos.locations.reverseGeocode({ latitude: places.talatona.coords.latitude + 0.01, longitude: places.talatona.coords.longitude });
    expect(near).toMatchObject({ area: "Talatona", label: expect.stringMatching(/^Perto de /) });
  });
});

describe("ExpoDeviceLocation (expo-location)", () => {
  // O jest.setup já carregou a camada de dados com o expo-location real:
  // carrega-se aqui uma cópia isolada, que vê o mock acima.
  let ExpoDeviceLocation: typeof import("@/data/device/DeviceLocation").ExpoDeviceLocation;
  let mocked: jest.Mocked<typeof import("expo-location")>;
  beforeEach(() => {
    jest.isolateModules(() => {
      ExpoDeviceLocation = require("@/data/device/DeviceLocation").ExpoDeviceLocation;
      mocked = require("expo-location");
    });
  });

  it("devolve a posição actual quando autorizado", async () => {
    mocked.getForegroundPermissionsAsync.mockResolvedValue({ granted: true } as never);
    mocked.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: -8.9, longitude: 13.2 } } as never);
    expect(await new ExpoDeviceLocation().coords()).toEqual({ latitude: -8.9, longitude: 13.2 });
  });

  it("sem autorização não lê o GPS", async () => {
    mocked.getForegroundPermissionsAsync.mockResolvedValue({ granted: false } as never);
    expect(await new ExpoDeviceLocation().coords()).toBeNull();
    expect(mocked.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it("se o GPS falhar, devolve null em vez de rebentar; o pedido de autorização devolve a resposta do sistema", async () => {
    mocked.getForegroundPermissionsAsync.mockResolvedValue({ granted: true } as never);
    mocked.getCurrentPositionAsync.mockRejectedValue(new Error("sem sinal"));
    expect(await new ExpoDeviceLocation().coords()).toBeNull();
    mocked.requestForegroundPermissionsAsync.mockResolvedValue({ granted: true } as never);
    expect(await new ExpoDeviceLocation().requestPermission()).toBe(true);
  });
});
