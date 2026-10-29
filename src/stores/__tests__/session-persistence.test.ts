import { configureMock, MockSecureStorage, mockRuntime, resetMockDatabase, sessionVault, setSecureStorage } from "@/data";
import { useSessionStore } from "@/stores/useSessionStore";

const initial = useSessionStore.getState();

/** Simula fechar e voltar a abrir a app: a store volta ao início, o armazenamento seguro fica. */
const reopen = () => useSessionStore.setState({ ...initial }, true);

describe("sessão guardada no armazenamento seguro", () => {
  let storage: MockSecureStorage;
  beforeEach(() => {
    resetMockDatabase();
    storage = new MockSecureStorage();
    setSecureStorage(storage);
    reopen();
  });

  it("sem sessão guardada, o arranque termina sem autenticar", async () => {
    await useSessionStore.getState().restore();
    expect(useSessionStore.getState()).toMatchObject({ restored: true, authenticated: false, hasOnboarded: false });
  });

  it("login guarda o token e o perfil; ao reabrir a sessão é retomada", async () => {
    useSessionStore.getState().completeOnboarding();
    useSessionStore.getState().setRole("provider");
    await useSessionStore.getState().login("joao@angoleva.ao", "segredo12");
    const { token, user } = useSessionStore.getState();
    expect(await sessionVault().load()).toEqual({ token, refreshToken: expect.any(String), role: "provider" });

    reopen();
    await useSessionStore.getState().restore();
    expect(useSessionStore.getState()).toMatchObject({ authenticated: true, hasOnboarded: true, role: "provider", token, providerId: expect.any(String) });
    expect(useSessionStore.getState().user.id).toBe(user.id);
  });

  it("ao reabrir com o token de acesso expirado, renova-o com o refresh token", async () => {
    const ttl = mockRuntime.accessTokenTtlMs;
    configureMock({ accessTokenTtlMs: 1 });
    await useSessionStore.getState().login("ana@angoleva.ao", "segredo12");
    configureMock({ accessTokenTtlMs: ttl });
    const old = await sessionVault().load();
    await new Promise((resolve) => setTimeout(resolve, 5));

    reopen();
    await useSessionStore.getState().restore();
    const stored = await sessionVault().load();
    expect(useSessionStore.getState()).toMatchObject({ authenticated: true, token: stored?.token });
    expect(stored?.token).not.toBe(old?.token);
    expect(stored?.refreshToken).not.toBe(old?.refreshToken);
  });

  it("logout apaga a sessão guardada e invalida o token", async () => {
    await useSessionStore.getState().login("ana@angoleva.ao", "segredo12");
    const { token } = useSessionStore.getState();
    await useSessionStore.getState().logout();
    expect(await sessionVault().load()).toBeNull();

    // Mesmo que o token volte a aparecer no dispositivo, o servidor já não o aceita.
    await sessionVault().save({ token: token!, role: "client" });
    reopen();
    await useSessionStore.getState().restore();
    expect(useSessionStore.getState().authenticated).toBe(false);
    expect(await sessionVault().load()).toBeNull();
  });
});
