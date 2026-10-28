import { createApiRepositories } from "@/data/api/ApiRepositories";
import type { DeviceCamera, PickedImage } from "@/data/device/DeviceCamera";
import { http } from "@/data/http/client";
import { MockDatabase } from "@/data/mock/database";
import { createMockServer } from "@/data/mock/server";

jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

// PNG 1×1 em data URI: o "ficheiro" que a câmara devolve nos testes.
const PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X8z9sAAAAASUVORK5CYII=";

const camera = (image: PickedImage | null): DeviceCamera => ({ take: jest.fn(async () => image) });

async function api(cam: DeviceCamera) {
  http.defaults.adapter = createMockServer(new MockDatabase()).adapter;
  const repos = createApiRepositories({ camera: cam });
  await repos.auth.login("joao.manuel@angoleva.ao", "segredo12", "provider");
  return repos;
}

describe("fotografias: câmara do dispositivo + POST /uploads", () => {
  it("envia a foto e devolve-a com o URL dado pela API", async () => {
    const repos = await api(camera({ uri: PIXEL, mimeType: "image/png", fileName: "carga.png" }));
    const photo = await repos.media.capture("cargo", 0);
    expect(photo).toMatchObject({ id: expect.stringMatching(/^upl-cargo-/), asset: expect.stringMatching(/^(blob|data):/), caption: "Foto da carga" });
  });

  it("cancelar a câmara não envia nada", async () => {
    const repos = await api(camera(null));
    expect(await repos.media.capture("delivery", 0)).toBeNull();
    expect(await repos.media.pickupSet()).toEqual([]);
  });

  it("a API recusa ficheiros que não são imagens", async () => {
    const repos = await api(camera({ uri: "data:text/plain;base64,b2zDoQ==", mimeType: "text/plain", fileName: "nota.txt" }));
    await expect(repos.media.capture("cargo", 0)).rejects.toMatchObject({ code: "validation" });
  });

  it("sem câmara configurada (demonstração), usa as fotos de exemplo", async () => {
    http.defaults.adapter = createMockServer(new MockDatabase()).adapter;
    const repos = createApiRepositories();
    expect((await repos.media.capture("vehicle", 0))?.asset).toBe("hilux-street");
  });
});

describe("ExpoDeviceCamera (expo-image-picker)", () => {
  let ExpoDeviceCamera: typeof import("@/data/device/DeviceCamera").ExpoDeviceCamera;
  let picker: jest.Mocked<typeof import("expo-image-picker")>;
  beforeEach(() => {
    jest.isolateModules(() => {
      ExpoDeviceCamera = require("@/data/device/DeviceCamera").ExpoDeviceCamera;
      picker = require("expo-image-picker");
    });
  });

  it("usa a câmara quando autorizada", async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue({ granted: true } as never);
    picker.launchCameraAsync.mockResolvedValue({ canceled: false, assets: [{ uri: "file:///foto.jpg", mimeType: "image/jpeg", fileName: "foto.jpg" }] } as never);
    expect(await new ExpoDeviceCamera().take("cargo")).toEqual({ uri: "file:///foto.jpg", mimeType: "image/jpeg", fileName: "foto.jpg" });
    expect(picker.launchImageLibraryAsync).not.toHaveBeenCalled();
  });

  it("sem câmara autorizada, abre a galeria; cancelar devolve null", async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue({ granted: false } as never);
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true } as never);
    picker.launchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: null } as never);
    expect(await new ExpoDeviceCamera().take("delivery")).toBeNull();
    expect(picker.launchImageLibraryAsync).toHaveBeenCalled();
  });
});
