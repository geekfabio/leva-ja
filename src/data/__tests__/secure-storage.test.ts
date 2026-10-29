import { MockSecureStorage, SessionVault } from "@/data/storage";

describe("armazenamento seguro (mock)", () => {
  it("guarda, lê e apaga como o expo-secure-store", async () => {
    const storage = new MockSecureStorage();
    expect(await storage.getItem("angoleva.x")).toBeNull();
    await storage.setItem("angoleva.x", "1");
    expect(await storage.getItem("angoleva.x")).toBe("1");
    await storage.deleteItem("angoleva.x");
    expect(await storage.getItem("angoleva.x")).toBeNull();
  });

  it("recusa chaves e valores que o nativo não aceita", async () => {
    const storage = new MockSecureStorage();
    await expect(storage.setItem("chave inválida", "1")).rejects.toMatchObject({ code: "validation" });
    await expect(storage.setItem("angoleva.grande", "x".repeat(3000))).rejects.toMatchObject({ code: "validation" });
  });
});

describe("SessionVault", () => {
  it("guarda e limpa a sessão e o onboarding", async () => {
    const vault = new SessionVault(new MockSecureStorage());
    expect(await vault.load()).toBeNull();
    await vault.save({ token: "t1", role: "provider" });
    expect(await vault.load()).toEqual({ token: "t1", role: "provider" });
    await vault.clear();
    expect(await vault.load()).toBeNull();
    expect(await vault.hasOnboarded()).toBe(false);
    await vault.markOnboarded();
    expect(await vault.hasOnboarded()).toBe(true);
  });

  it("descarta dados corrompidos", async () => {
    const storage = new MockSecureStorage();
    await storage.setItem("angoleva.session", "{nao é json");
    expect(await new SessionVault(storage).load()).toBeNull();
    expect(storage.keys()).not.toContain("angoleva.session");
  });
});
