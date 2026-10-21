import { useServiceStore } from "@/stores/useServiceStore";
import { useProviderStore } from "@/stores/useProviderStore";
import { useBookingStore } from "@/stores/useBookingStore";
import { places } from "@/mocks/places";
import { deliveryPhotos } from "@/mocks/photos";

function cargoDraft() {
  const booking = useBookingStore.getState();
  booking.start("cargo");
  booking.patch({ origin: places.ingombota, destination: places.talatona });
  return useBookingStore.getState().draft;
}

beforeEach(() => {
  useServiceStore.getState().reset();
  useProviderStore.getState().reset();
});

describe("ciclo de vida partilhado cliente ↔ prestador", () => {
  it("rejeita rascunhos incompletos", () => {
    const draft = { ...cargoDraft(), destination: null };
    expect(useServiceStore.getState().createFromDraft(draft, "cli-armando")).toBeNull();
  });

  it("conclui um pedido de carga do início ao fim e credita o prestador", () => {
    const store = useServiceStore.getState();
    const id = store.createFromDraft(cargoDraft(), "cli-armando")!;
    expect(id).toBeTruthy();
    expect(useServiceStore.getState().activeClientRequestId).toBe(id);

    expect(store.accept(id)).toBe(true);
    expect(store.transition(id, "en_route", "provider")).toBe(true);
    expect(store.transition(id, "arrived", "provider")).toBe(true);
    // O prestador não pode confirmar a recolha pelo cliente.
    expect(store.transition(id, "pickup_confirmed", "provider")).toBe(false);
    expect(store.transition(id, "pickup_confirmed", "client")).toBe(true);
    expect(store.cancel(id, "teste")).toBe(false);
    expect(store.transition(id, "in_transit", "provider")).toBe(true);

    const balance = useProviderStore.getState().balance;
    expect(store.submitProof(id, { photos: deliveryPhotos, signedBy: "Armando Manuel", goodCondition: true })).toBe(true);
    const request = useServiceStore.getState().requests.find((r) => r.id === id)!;
    expect(request.status).toBe("delivered");
    expect(useProviderStore.getState().balance).toBe(balance + request.providerEarning);

    expect(store.rate(id, 5)).toBe(false);
    expect(store.pay(id, "card")).toBe(true);
    expect(store.rate(id, 5, "Excelente")).toBe(true);
    const done = useServiceStore.getState().requests.find((r) => r.id === id)!;
    expect(done.status).toBe("rated");
    expect(done.timeline.map((e) => e.status)).toEqual(["searching", "assigned", "en_route", "arrived", "pickup_confirmed", "in_transit", "delivered", "paid", "rated"]);
    expect(useServiceStore.getState().activeClientRequestId).toBeNull();
  });

  it("não aceita pedidos quando o prestador está indisponível", () => {
    const id = useServiceStore.getState().createFromDraft(cargoDraft(), "cli-armando")!;
    useProviderStore.getState().setOnline(false);
    expect(useServiceStore.getState().accept(id)).toBe(false);
  });

  it("mudança de casa: proposta aceite actualiza o preço e atribui o pedido", () => {
    const store = useServiceStore.getState();
    const before = useServiceStore.getState().requests.find((r) => r.id === "req-near-4")!;
    expect(store.submitProposal("req-near-4", 40000, "Inclui 2 ajudantes e escadas")).toBe(true);
    store.answerProposal("req-near-4", true);
    const after = useServiceStore.getState().requests.find((r) => r.id === "req-near-4")!;
    expect(after.status).toBe("assigned");
    expect(after.price.total).toBe(40000 + before.price.platformFee);
    expect(after.proposal?.status).toBe("accepted");
  });

  it("proposta recusada devolve o pedido à lista", () => {
    const store = useServiceStore.getState();
    store.submitProposal("req-near-4", 40000, "Inclui 2 ajudantes e escadas");
    store.answerProposal("req-near-4", false);
    const r = useServiceStore.getState().requests.find((x) => x.id === "req-near-4")!;
    expect(r.status).toBe("searching");
    expect(r.providerId).toBeUndefined();
  });

  it("levantamento reduz o saldo e fica pendente", () => {
    jest.useFakeTimers();
    const { balance } = useProviderStore.getState();
    const id = useProviderStore.getState().withdraw(20000);
    expect(useProviderStore.getState().balance).toBe(balance - 20000);
    expect(useProviderStore.getState().transactions.find((t) => t.id === id)?.status).toBe("pending");
    jest.runAllTimers();
    expect(useProviderStore.getState().transactions.find((t) => t.id === id)?.status).toBe("completed");
    jest.useRealTimers();
  });
});
