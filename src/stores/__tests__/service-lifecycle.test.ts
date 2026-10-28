import { repositories, resetMockDatabase, setAuthTokens } from "@/data";
import { DEMO_TOKEN } from "@/data/mock/demo";
import { useServiceStore } from "@/stores/useServiceStore";
import { useProviderStore } from "@/stores/useProviderStore";
import { useBookingStore } from "@/stores/useBookingStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { places } from "@/mocks/places";
import { deliveryPhotos } from "@/mocks/photos";

function cargoDraft() {
  const booking = useBookingStore.getState();
  booking.start("cargo");
  booking.patch({ origin: places.ingombota, destination: places.talatona });
  return useBookingStore.getState().draft;
}

const find = (id: string) => useServiceStore.getState().requests.find((r) => r.id === id)!;

/** A API só deixa o dono do pedido responder à proposta: entra como esse cliente. */
async function asClient(email: string, action: () => Promise<unknown>) {
  const session = await repositories().auth.login(email, "segredo12", "client");
  try {
    return await action();
  } finally {
    void session;
    setAuthTokens({ token: DEMO_TOKEN });
  }
}

beforeEach(async () => {
  resetMockDatabase();
  setAuthTokens({ token: DEMO_TOKEN });
  useServiceStore.getState().clear();
  await useServiceStore.getState().hydrate();
  await useProviderStore.getState().hydrate(useSessionStore.getState().providerId!);
});

describe("ciclo de vida partilhado cliente ↔ prestador (stores sobre repositórios)", () => {
  it("rejeita rascunhos incompletos", async () => {
    const draft = { ...cargoDraft(), destination: null };
    expect(await useServiceStore.getState().createFromDraft(draft, "cli-armando")).toBeNull();
  });

  it("conclui um pedido de carga do início ao fim e credita o prestador", async () => {
    const store = useServiceStore.getState();
    const id = (await store.createFromDraft(cargoDraft(), "cli-armando"))!;
    expect(id).toBeTruthy();
    expect(useServiceStore.getState().activeClientRequestId).toBe(id);
    expect(find(id).client?.name).toBe("Armando Manuel");

    expect(await store.accept(id)).toBe(true);
    expect(find(id).provider?.name).toBe("João Manuel");
    expect(await store.transition(id, "en_route", "provider")).toBe(true);
    expect(await store.transition(id, "arrived", "provider")).toBe(true);
    // O prestador não pode confirmar a recolha pelo cliente.
    expect(await store.transition(id, "pickup_confirmed", "provider")).toBe(false);
    expect(useServiceStore.getState().lastError).toMatch(/outro interveniente/);
    expect(await store.transition(id, "pickup_confirmed", "client")).toBe(true);
    expect(await store.cancel(id, "teste")).toBe(false);
    expect(await store.transition(id, "in_transit", "provider")).toBe(true);

    const balance = useProviderStore.getState().balance;
    expect(await store.submitProof(id, { photos: deliveryPhotos, signedBy: "Armando Manuel", goodCondition: true })).toBe(true);
    expect(find(id).status).toBe("delivered");
    // A carteira é actualizada pelo repositório e chega à store pela subscrição.
    expect(useProviderStore.getState().balance).toBe(balance + find(id).providerEarning);

    expect(await store.rate(id, 5)).toBe(false);
    expect(await store.pay(id, "card")).toBe(true);
    expect(await store.rate(id, 5, "Excelente")).toBe(true);
    expect(find(id).timeline.map((e) => e.status)).toEqual(["searching", "assigned", "en_route", "arrived", "pickup_confirmed", "in_transit", "delivered", "paid", "rated"]);
    expect(useServiceStore.getState().activeClientRequestId).toBeNull();
  });

  it("não aceita pedidos quando o prestador está indisponível", async () => {
    const id = (await useServiceStore.getState().createFromDraft(cargoDraft(), "cli-armando"))!;
    await useProviderStore.getState().setOnline(false);
    expect(await useServiceStore.getState().accept(id)).toBe(false);
  });

  it("mudança de casa: proposta aceite actualiza o preço e atribui o pedido", async () => {
    const store = useServiceStore.getState();
    // Fora da cobertura do prestador de demonstração: abre-o como numa ligação directa.
    const before = await repositories().requests.get("req-near-4");
    store.upsert(before);
    expect(await store.submitProposal("req-near-4", 40000, "Inclui 2 ajudantes e escadas")).toBe(true);
    expect(await asClient("carlos.mendes@email.com", () => store.answerProposal("req-near-4", true))).toBe(true);
    const after = find("req-near-4");
    expect(after.status).toBe("assigned");
    expect(after.price.total).toBe(40000 + before.price.platformFee);
    expect(after.proposal?.status).toBe("accepted");
  });

  it("proposta recusada devolve o pedido à lista", async () => {
    const store = useServiceStore.getState();
    store.upsert(await repositories().requests.get("req-near-4"));
    await store.submitProposal("req-near-4", 40000, "Inclui 2 ajudantes e escadas");
    await asClient("carlos.mendes@email.com", () => store.answerProposal("req-near-4", false));
    expect(find("req-near-4").status).toBe("searching");
    expect(find("req-near-4").providerId).toBeUndefined();
  });

  it("levantamento reduz o saldo e conclui pela simulação do servidor", async () => {
    const { balance } = useProviderStore.getState();
    expect(await useProviderStore.getState().withdraw(20000)).toBe(true);
    expect(useProviderStore.getState().balance).toBe(balance - 20000);
    expect(useProviderStore.getState().transactions[0]?.status).toBe("pending");
    await new Promise((r) => setTimeout(r, 30));
    expect(useProviderStore.getState().transactions[0]?.status).toBe("completed");
    expect(await useProviderStore.getState().withdraw(10_000_000)).toBe(false);
  });
});
