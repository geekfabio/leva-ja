# Arquitectura da app Leva Já

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
    types.ts               RepositoryError (network, not_found, invalid_transition, forbidden, validation, unauthorized)
  mock/                    implementação de demonstração
    database.ts            MockDatabase em memória, semeada a partir de src/mocks
    runtime.ts             latência, falhas de rede simuladas, cópias defensivas, efeitos "do servidor"
    events.ts              emissor para o tempo real simulado
    Mock*Repository.ts     uma classe por contrato
  http/                    implementação REST (esqueleto)
    client.ts              axios + conversão de erros HTTP em RepositoryError
    HttpRepositories.ts    endpoints propostos para cada método; subscribe por polling até haver WebSocket
```

**Regras:**

- Ecrãs, componentes, stores e hooks importam de `@/data`; **nunca** de `@/mocks`. Só `src/data/mock` usa os mocks.
- Os repositórios devolvem sempre cópias e pedidos já com `client` e `provider` incluídos, como uma resposta de API.
- As regras de negócio que o servidor terá de garantir (máquina de estados, actor de cada transição, prestador disponível, saldo do levantamento, crédito do ganho na entrega) estão na implementação mock; o cliente não as duplica.
- Erros chegam como `RepositoryError` com um `code`; as stores guardam a mensagem em `lastError` e os ecrãs mostram-na.
- O que o servidor faria sozinho (validar documentos, concluir transferências, responder no chat) é simulado no mock com `later()` e publicado por `subscribe`.

## Fluxo de dados

1. `DataBootstrap` (`src/providers`) hidrata as stores a partir dos repositórios e subscreve `requests.subscribe` e `providers.subscribe`. Volta a carregar quando o utilizador ou o prestador da sessão mudam.
2. Os ecrãs lêem a cache das stores (`useRequest`, `useMyProvider`…) ou consultas TanStack Query; as stores invalidam as consultas sempre que mudam.
3. As acções (`useServiceStore.getState().accept(...)`) chamam o repositório, guardam o resultado e devolvem `true/false`.
4. A área do prestador só abre depois de o `ProviderRepository` devolver o perfil (porta no layout `(provider)`).
5. `useClientSimulation` faz avançar estados que, com backend, chegariam por push; usa as mesmas acções da store com actor `system`.

## Mudar de mocks para a API

1. Completar `src/data/http/HttpRepositories.ts` segundo o contrato real do backend.
2. Definir `EXPO_PUBLIC_DATA_SOURCE=http` e `EXPO_PUBLIC_API_URL`.
3. Validar a implementação com a suite de contrato (`src/data/__tests__/repositories.contract.test.ts`), chamando `contract("http", ...)` contra um servidor de testes.
4. Substituir o polling de `subscribe` por WebSocket ou push quando existir.
5. Ligar `MediaRepository` a `expo-image-picker` e a um endpoint de upload; `Photo.asset` passa a URL (o `imageSource` já aceita URLs).
6. Guardar o token em `expo-secure-store` num interceptor de `src/data/http/client.ts`.

Em modo `http`, não existe sessão de demonstração (`demoIdentity`) e «Repor dados de demonstração» desaparece das definições.

## Testes

- `src/data/__tests__/repositories.contract.test.ts` — comportamento esperado de qualquer implementação.
- `src/stores/__tests__/service-lifecycle.test.ts` — stores sobre os repositórios, do pedido ao levantamento.
- `jest.setup.ts` põe a latência dos mocks a zero.
