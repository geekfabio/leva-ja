# Arquitectura da app AngoLeva

Esta fase não tem backend. Os dados de demonstração estão atrás do **padrão Repository**: a app só conhece contratos (interfaces) e uma implementação é escolhida em tempo de arranque. Trocar mocks pela API é trocar a implementação, sem mexer nos ecrãs nem nas stores.

## Camadas

| Camada | Pasta | Responsabilidade |
| --- | --- | --- |
| Rotas e ecrãs | `src/app` | Composição de componentes, navegação e ligação a stores/hooks. Sem regras de negócio nem acesso a dados. |
| Componentes | `src/components/kit.ts` (`core`, `service`, `partner`, `map`) | UI reutilizável, acessível e sem estado global. |
| Domínio | `src/types/domain.ts`, `src/features` | Tipos, máquina de estados, preços, catálogo, esquemas Zod, simulação do lado do cliente. Funções puras e testadas. |
| Estado | `src/stores` | Zustand: **cache** dos dados vindos dos repositórios + estado de sessão/UI (rascunho do pedido, preferências do dispositivo). |
| Consultas | `src/services/queries.ts` | Hooks TanStack Query sobre os repositórios (listas, pesquisa, ganhos) com carregamento, erro e repetição. |
| **Dados** | `src/data` | Contratos dos repositórios, implementação mock, implementação HTTP e contentor. |
| Dados de demonstração | `src/mocks` | Sementes usadas **apenas** por `src/data/mock`. |

## Camada de dados (`src/data`)

```
src/config/env.ts         variáveis EXPO_PUBLIC_* validadas (origem dos dados, URL, timeouts, armazenamento)
src/data/
  index.ts                 contentor: repositories(), setRepositories(), dataSource, demoIdentity
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
  mock/                    implementação de demonstração
    database.ts            MockDatabase em memória, semeada a partir de src/mocks
    runtime.ts             latência, falhas de rede simuladas, cópias defensivas, efeitos "do servidor"
    events.ts              emissor para o tempo real simulado
    Mock*Repository.ts     uma classe por contrato
    server.ts              API simulada: os endpoints de docs/api.md sobre a MockDatabase (adaptador axios)
  storage/                 armazenamento seguro no dispositivo
    SecureStorage.ts       contrato (espelha o expo-secure-store) e regras de chave/tamanho
    MockSecureStorage.ts   SecureStore simulado em memória (por omissão)
    DeviceSecureStorage.ts expo-secure-store (EXPO_PUBLIC_SECURE_STORAGE=device; não existe na web)
    SessionVault.ts        guarda { token, role } e o fim do onboarding; descarta dados corrompidos
  http/                    implementação REST
    client.ts              axios: token Bearer, cabeçalhos, repetição de GET, erros HTTP → RepositoryError, aviso de 401
    HttpRepositories.ts    um endpoint por método (docs/api.md); subscribe por polling com cursor até haver WebSocket
```

**Regras:**

- Ecrãs, componentes, stores e hooks importam de `@/data`; **nunca** de `@/mocks`. Só `src/data/mock` usa os mocks.
- Os repositórios devolvem sempre cópias e pedidos já com `client` e `provider` incluídos, como uma resposta de API.
- As regras de negócio que o servidor terá de garantir (máquina de estados, actor de cada transição, prestador disponível, saldo do levantamento, crédito do ganho na entrega) estão na implementação mock; o cliente não as duplica.
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
| `EXPO_PUBLIC_DATA_SOURCE` | `mock` \| `http` | `mock` |
| `EXPO_PUBLIC_API_URL` | URL da API, ou `mock://local` para a API simulada | — (obrigatória em `http`) |
| `EXPO_PUBLIC_API_TIMEOUT_MS` | ms | `10000` |
| `EXPO_PUBLIC_POLL_INTERVAL_MS` | ms (mín. 1000) | `5000` |
| `EXPO_PUBLIC_SECURE_STORAGE` | `mock` \| `device` | `mock` |

Uma configuração inválida falha no arranque com uma mensagem que diz qual variável corrigir.

**O que a camada HTTP já faz** (`src/data/http/`):

- `Authorization: Bearer` em todos os pedidos depois do login ou da sessão retomada. Também envia `Accept-Language: pt-PT`, `X-Client` e `X-Request-Id`.
- Converte estados HTTP em `RepositoryError` (`validation`, `unauthorized`, `forbidden`, `not_found`, `invalid_transition`, `server`, `network`), com mensagens em pt-PT quando a API não manda uma.
- Repete uma vez os GET que falham por rede ou por 502, 503 ou 504.
- Um 401 num pedido com token termina a sessão (`useSessionStore.expire`), mostra «Sessão expirada» e abre o login (`DataBootstrap`).
- Tempo real por polling com cursor (`…/changes?since=`): cada alteração chega uma vez. O estado do prestador só é publicado quando muda.

**API simulada** (`src/data/mock/server.ts`): adaptador do axios que serve todos os endpoints a partir da `MockDatabase`, com token, códigos HTTP e cursores. Com `EXPO_PUBLIC_DATA_SOURCE=http` e `EXPO_PUBLIC_API_URL=mock://local`, a app corre por toda a camada HTTP sem backend. A suite de contrato corre sobre ela.

**Passos com o backend real:**

1. Apontar `EXPO_PUBLIC_API_URL` para o servidor de testes e correr a app em modo `http`.
2. Juntar `contract("http (servidor de testes)", …)` em `repositories.contract.test.ts` e corrigir o que divergir, no backend ou em `HttpRepositories.ts`.
3. Activar `EXPO_PUBLIC_SECURE_STORAGE=device` nas builds Android e iOS.
4. A seguir: WebSocket em vez de polling, `MediaRepository` com `expo-image-picker` e `/uploads`, notificações push, renovação de token (ver «Ainda por integrar» em [api.md](api.md)).

Em modo `http` não existe sessão de demonstração (`demoIdentity`), e «Repor dados de demonstração» desaparece das definições.

## Testes

- `src/data/__tests__/repositories.contract.test.ts` — comportamento esperado de qualquer implementação; corre sobre os mocks e sobre a camada HTTP com a API simulada.
- `src/data/__tests__/http-client.test.ts` — erros HTTP, sessão expirada, token, repetição sem rede, polling e validação do `.env`.
- `src/stores/__tests__/service-lifecycle.test.ts` — stores sobre os repositórios, do pedido ao levantamento.
- `src/data/__tests__/secure-storage.test.ts` — SecureStore mock e `SessionVault`.
- `src/stores/__tests__/session-persistence.test.ts` — guardar, retomar e terminar a sessão.
- `jest.setup.ts` põe a latência dos mocks a zero.
