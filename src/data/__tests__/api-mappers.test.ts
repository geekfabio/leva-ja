import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import * as Dto from "@/data/api/dto";
import * as map from "@/data/api/mappers";
import { parse } from "@/data/api/ApiRepositories";
import { toRepositoryError } from "@/data/http/client";
import { createMockRepositories } from "@/data/mock";
import { MockDatabase } from "@/data/mock/database";
import { initialsOf } from "@/utils/format";
import type { ServiceRequest } from "@/types/domain";
import requestFixture from "@/data/api/__fixtures__/service-request.json";
import sessionFixture from "@/data/api/__fixtures__/session.json";
import errorFixture from "@/data/api/__fixtures__/error.json";

/** As iniciais não viajam na API: a app calcula-as a partir do nome. */
const withComputedInitials = (r: ServiceRequest): ServiceRequest => ({
  ...r,
  client: r.client && { ...r.client, initials: initialsOf(r.client.name) },
  provider: r.provider && { ...r.provider, initials: initialsOf(r.provider.name) },
});

describe("formato da API → domínio (fixtures escritas à mão, como as do backend)", () => {
  it("pedido de serviço", () => {
    const request = map.toServiceRequest(parse(Dto.envelope(Dto.ServiceRequestDto), requestFixture, "fixture").data);
    expect(request).toMatchObject({
      code: "AL-30120",
      kind: "tow",
      status: "en_route",
      providerId: "prv-paulo",
      origin: { area: "Maianga", coords: { latitude: -8.8256, longitude: 13.2311 } },
      price: { base: 8000, platformFee: 500, total: 13500 },
      providerEarning: 11050,
      tow: { incident: "mechanical", canMove: false },
      paymentMethod: "bank_reference",
    });
    expect(request.client).toMatchObject({ name: "Armando Manuel", initials: "AM", avatar: "https://cdn.angoleva.ao/avatars/cli-armando.jpg" });
    expect(request.provider).toMatchObject({ initials: "PD", reviewsCount: 212, vehicle: { vehicleClass: "tow_truck", capacityKg: 3500 }, avatar: undefined });
    expect(request.photos[0]).toEqual({ id: "ph-1", asset: "https://cdn.angoleva.ao/requests/req-30120/1.jpg", caption: "Viatura parada" });
    expect(request.cargo).toBeUndefined();
    expect(request.scheduledFor).toBeUndefined();
    expect(request.timeline.map((e) => e.status)).toEqual(["searching", "assigned", "en_route"]);
  });

  it("sessão", () => {
    const session = map.toSession(parse(Dto.envelope(Dto.SessionDto), sessionFixture, "fixture").data);
    expect(session).toEqual({
      token: "eyJhbGciOiJIUzI1NiJ9.exemplo.assinatura",
      refreshToken: "rt_3f9c2a71b8e04d6f",
      user: expect.objectContaining({ id: "cli-armando", initials: "AM" }),
      providerId: undefined,
    });
  });

  it("erro: a mensagem do servidor chega ao ecrã", () => {
    const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
    const error = new AxiosError("409", "ERR_BAD_REQUEST", config, {}, { status: 409, statusText: "", data: errorFixture, headers: {}, config });
    expect(toRepositoryError(error)).toMatchObject({ code: "invalid_transition", message: "Este pedido já não pode ser cancelado." });
  });

  it("uma resposta fora do contrato é recusada com erro do servidor", () => {
    const broken = { data: { ...requestFixture.data, pricing: { total: "13500" } } };
    expect(() => parse(Dto.envelope(Dto.ServiceRequestDto), broken, "fixture")).toThrow(expect.objectContaining({ code: "server" }));
  });
});

describe("ida e volta domínio → API → domínio sobre todos os dados de demonstração", () => {
  const database = new MockDatabase();
  const repos = createMockRepositories(database);

  it("pedidos", async () => {
    const requests = await repos.requests.list();
    expect(requests.length).toBeGreaterThan(5);
    for (const request of requests) {
      const wire = JSON.parse(JSON.stringify(map.fromServiceRequest(request)));
      expect(map.toServiceRequest(Dto.ServiceRequestDto.parse(wire))).toEqual(withComputedInitials(request));
    }
  });

  it("estado do prestador, conta e suporte", async () => {
    const state = await repos.providers.getState("prv-joao");
    const back = map.toProviderState(Dto.ProviderStateDto.parse(JSON.parse(JSON.stringify(map.fromProviderState(state)))));
    expect(back).toEqual({ ...state, profile: { ...state.profile, initials: initialsOf(state.profile.name) } });

    for (const address of await repos.account.addresses("cli-armando")) expect(map.toSavedAddress(Dto.SavedAddressDto.parse(map.fromSavedAddress(address)))).toEqual(address);
    for (const method of await repos.account.paymentMethods("cli-armando")) expect(map.toPaymentMethod(Dto.PaymentMethodDto.parse(map.fromPaymentMethod(method)))).toEqual(method);
    for (const contact of await repos.support.emergencyContacts()) expect(map.toEmergencyContact(Dto.EmergencyContactDto.parse(map.fromEmergencyContact(contact)))).toEqual(contact);
  });
});
