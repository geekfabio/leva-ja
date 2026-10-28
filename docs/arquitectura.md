# Arquitectura da app AngoLeva

Esta fase não tem backend, mas a app já funciona como se tivesse. Os dados estão atrás do **padrão Repository**: ecrãs e stores só conhecem contratos (interfaces). A implementação usada é sempre a da API (`ApiRepositories`), que recebe JSON no formato da API, valida-o e converte-o para o domínio.

Nesta fase, quem responde é uma **API simulada dentro da app**, sobre dados de demonstração. Passar para o backend real é mudar `EXPO_PUBLIC_DATA_SOURCE=http` e o URL, sem mexer em ecrãs, stores nem repositórios.

```
ecrãs/stores → contratos (repositories/) → ApiRepositories → mappers ← JSON da API (dto.ts)
                                                 │ axios + canal de tempo real
                         ┌───────────────────────┴───────────────────────┐
              mock: API simulada (server.ts)                 http: backend real
              serviços Mock*Repository + MockDatabase        (polling até haver WebSocket)
              socket simulado (como o futuro WebSocket)
```

## Camadas

| Camada | Pasta | Responsabilidade |
| --- | --- | --- |
| Rotas e ecrãs | `src/app` | Composição de componentes, navegação e ligação a stores/hooks. Sem regras de negócio nem acesso a dados. |
| Componentes | `src/components/kit.ts` (`core`, `service`, `partner`, `map`) | UI reutilizável, acessível e sem estado global. |
| Domínio | `src/types/domain.ts`, `src/features` | Tipos, máquina de estados, preços, catálogo, esquemas Zod, simulação do lado do cliente. Funções puras e testadas. |
| Estado | `src/stores` | Zustand: **cache** dos dados vindos dos repositórios + estado de sessão/UI (rascunho do pedido, preferências do dispositivo). |
| Consultas | `src/services/queries.ts` | Hooks TanStack Query sobre os repositórios (listas, pesquisa, ganhos) com carregamento, erro e repetição. |
| **Dados** | `src/data` | Contratos, repositórios da API (DTOs, mappers, tempo real), API simulada, armazenamento seguro e contentor. |
| Dados de demonstração | `src/mocks` | Sementes da API simulada, usadas **apenas** por `src/data/mock`. |

## Camada de dados (`src/data`)

```
src/config/env.ts         variáveis EXPO_PUBLIC_* validadas (origem dos dados, URL, timeouts, armazenamento)
src/data/
  index.ts                 contentor: repositories(), setRepositories(), dataSource, demoIdentity
  api/                     a implementação usada pela app
    dto.ts                 formato de fio da API (Zod): snake_case, envelopes { data }, erros { error }
    mappers.ts             JSON da API ↔ modelo de domínio, nos dois sentidos
    ApiRepositories.ts     um endpoint por método; valida cada resposta e converte-a
    realtime.ts            canal de tempo real (tópicos requests, providers/<id>, threads/<id>); transporte por polling
    __fixtures__/          respostas de exemplo escritas à mão, no formato do backend
  repositories/            contratos — o que a app precisa, independente da origem
    AuthRepository         login, registo, recuperação, código, perfil, palavra-passe
    RequestRepository      pedidos: listar, criar, transições, proposta, comprovativo, pagamento, avaliação, subscribe
    ProviderRepository     estado do prestador, disponibilidade, viatura, cobertura, documentos, carteira, ganhos, subscribe
    LocationRepository     posição actual, pesquisa de moradas, bairros, viaturas próximas, distâncias
    ChatRepository         mensagens, envio, lidas, subscribe (mensagens e "a escrever…")
    AccountRepository      endereços e métodos de pagamento
    SupportRepository      ajuda, contactos de emergência, ocorrências, SOS
    MediaRepository        câmara/fotografias
    types.ts               RepositoryError (network, not_found, invalid_transition, forbidden, validation, unauthorized, server)
  mock/                    o "backend" da fase mock
    server.ts              API simulada: endpoints de docs/api.md em formato da API (adaptador axios) e socket de tempo real
    database.ts            MockDatabase em memória, semeada a partir de src/mocks (com a sessão de demonstração)
    runtime.ts             latência, falhas de rede simuladas, cópias defensivas, efeitos "do servidor"
    events.ts              emissor para o tempo real simulado
    Mock*Repository.ts     serviços do backend simulado: as regras de negócio (máquina de estados, saldo, cobertura…)
  device/
    DeviceLocation.ts      GPS do dispositivo (expo-location): autorização, posição com tempo limite; a morada vem da API
    DeviceCamera.ts        câmara ou galeria (expo-image-picker); o envio é feito por api/ApiMediaRepository (POST /uploads)
  storage/                 armazenamento seguro no dispositivo
    SecureStorage.ts       contrato (espelha o expo-secure-store) e regras de chave/tamanho
    MockSecureStorage.ts   SecureStore simulado em memória (por omissão)
    DeviceSecureStorage.ts expo-secure-store (EXPO_PUBLIC_SECURE_STORAGE=device; não existe na web)
    SessionVault.ts        guarda { token, role } e o fim do onboarding; descarta dados corrompidos
  http/
    client.ts              axios: token Bearer, cabeçalhos, repetição de GET, erros HTTP → RepositoryError, aviso de 401
```

**Regras:**

- Ecrãs, componentes, stores e hooks importam de `@/data`; **nunca** de `@/mocks`. Só `src/data/mock` usa os mocks.
- Os dados chegam sempre no formato da API, também em modo mock. Nenhum ecrã vê um campo `snake_case`: os mappers convertem tudo.
- Cada resposta é validada (`dto.ts`). Um formato inesperado dá `RepositoryError("server")` e nunca chega ao ecrã.
- Os pedidos vêm com `client` e `provider` incluídos, como na API.
- As regras de negócio que o servidor terá de garantir (máquina de estados, actor de cada transição, prestador disponível, saldo do levantamento, crédito do ganho na entrega) estão nos serviços mock; o cliente não as duplica.
- Erros chegam como `RepositoryError` com um `code`; as stores guardam a mensagem em `lastError` e os ecrãs mostram-na.
- O que o servidor faria sozinho (validar documentos, concluir transferências, responder no chat) é simulado no mock com `later()` e publicado por `subscribe`.

## Fluxo de dados

1. No arranque, `DataBootstrap` chama `useSessionStore.restore()`: lê o `SessionVault` e valida o token com `auth.restore`. Um token recusado (`unauthorized`) é apagado; sem rede, fica guardado. O splash espera por isto antes de decidir para onde ir. Login e confirmação de código guardam a sessão; terminar sessão apaga-a e invalida o token.
2. `DataBootstrap` (`src/providers`) hidrata as stores a partir dos repositórios e subscreve `requests.subscribe` e `providers.subscribe`. Volta a carregar quando o utilizador ou o prestador da sessão mudam.
3. Os ecrãs lêem a cache das stores (`useRequest`, `useMyProvider`…) ou consultas TanStack Query; as stores invalidam as consultas sempre que mudam.
4. As acções (`useServiceStore.getState().accept(...)`) chamam o repositório, guardam o resultado e devolvem `true/false`.
5. A área do prestador só abre depois de o `ProviderRepository` devolver o perfil (porta no layout `(provider)`).
6. `useClientSimulation` faz avançar estados que, com backend, chegariam por push; usa as mesmas acções da store com actor `system`.

## Mudar de mocks para a API

A app já está preparada para a API. O contrato completo (endpoints, erros, autenticação, tempo real) está em [api.md](api.md).

**Configuração** (`src/config/env.ts`, validada com Zod; modelo em `.env.example`):

| Variável | Valores | Por omissão |
| --- | --- | --- |
| `EXPO_PUBLIC_DATA_SOURCE` | `mock` (API simulada) \| `http` (backend real) | `mock` |
| `EXPO_PUBLIC_API_URL` | URL da API | — (obrigatória em `http`) |
| `EXPO_PUBLIC_API_TIMEOUT_MS` | ms | `10000` |
| `EXPO_PUBLIC_POLL_INTERVAL_MS` | ms (mín. 1000) | `5000` |
| `EXPO_PUBLIC_SECURE_STORAGE` | `mock` \| `device` | `mock` |
| `EXPO_PUBLIC_LOCATION` | `simulated` \| `device` | `simulated` com `mock`, `device` com `http` |
| `EXPO_PUBLIC_CAMERA` | `simulated` \| `device` | `simulated` com `mock`, `device` com `http` |

Uma configuração inválida falha no arranque com uma mensagem que diz qual variável corrigir.

**O que a camada da API já faz** (`src/data/api/`, `src/data/http/`):

- Valida cada resposta contra o formato da API e converte-a para o domínio. Converte cada corpo enviado para `snake_case`.
- `Authorization: Bearer` em todos os pedidos depois do login ou da sessão retomada. Também envia `Accept-Language: pt-PT`, `X-Client` e `X-Request-Id`.
- Converte estados HTTP em `RepositoryError` (`validation`, `unauthorized`, `forbidden`, `not_found`, `invalid_transition`, `server`, `network`), com mensagens em pt-PT quando a API não manda uma.
- Repete uma vez os GET que falham por rede ou por 502, 503 ou 504.
- Um 401 num pedido com token termina a sessão (`useSessionStore.expire`), mostra «Sessão expirada» e abre o login (`DataBootstrap`).
- Tempo real por um canal com tópicos (`realtime.ts`). Com a API real usa polling com cursor (`…/changes?since=`), em que cada alteração chega uma vez; o estado do prestador só é publicado quando muda.

**API simulada** (`src/data/mock/server.ts`, modo `mock`, por omissão):

- É um adaptador do axios que serve todos os endpoints no formato da API (envelopes, `snake_case`, erros `{ error }`, 201/204, cursores).
- Exige token e valida os corpos recebidos com os mesmos esquemas: dados fora do contrato dão 422.
- O tempo real chega por um socket em processo, com os mesmos tópicos que o futuro WebSocket, incluindo «a escrever…».
- Há uma sessão de demonstração com token (`DEMO_TOKEN`), para abrir qualquer ecrã sem login.

**Passos com o backend real:**

1. Apontar `EXPO_PUBLIC_API_URL` para o servidor de testes e correr a app em modo `http`.
2. Juntar `contract("servidor de testes", …)` em `repositories.contract.test.ts` e corrigir o que divergir, no backend ou em `dto.ts`/`mappers.ts`. Os ecrãs não mudam.
3. Activar `EXPO_PUBLIC_SECURE_STORAGE=device` nas builds Android e iOS.
4. A seguir: WebSocket em vez de polling, `MediaRepository` com `expo-image-picker` e `/uploads`, notificações push, renovação de token (ver «Ainda por integrar» em [api.md](api.md)).

Em modo `http` não existe sessão de demonstração (`demoIdentity`), e «Repor dados de demonstração» desaparece das definições.

## Testes

- `src/data/__tests__/repositories.contract.test.ts` — comportamento esperado de qualquer implementação. Corre sobre os serviços mock e sobre os repositórios da API com a API simulada, com o tempo real por socket e por polling.
- `src/data/__tests__/api-mappers.test.ts` — fixtures escritas à mão no formato do backend → domínio; respostas fora do contrato recusadas; ida e volta de todos os dados de demonstração.
- `src/data/__tests__/http-client.test.ts` — erros HTTP, sessão expirada, token, repetição sem rede, polling e validação do `.env`.
- `src/stores/__tests__/service-lifecycle.test.ts` — stores sobre os repositórios, do pedido ao levantamento.
- `src/data/__tests__/secure-storage.test.ts` — SecureStore mock e `SessionVault`.
- `src/stores/__tests__/session-persistence.test.ts` — guardar, retomar e terminar a sessão.
- `jest.setup.ts` põe a latência dos mocks a zero.
