# Arquitectura da app Leva Já

Esta fase não tem backend. O código está organizado para que os mocks possam ser trocados por uma API sem mexer nos ecrãs.

## Camadas

| Camada | Pasta | Responsabilidade |
| --- | --- | --- |
| Rotas e ecrãs | `src/app` | Composição de componentes, navegação e ligação a stores/hooks. Sem regras de negócio. |
| Componentes | `src/components/kit.ts` (`core`, `service`, `partner`, `map`) | UI reutilizável, acessível e sem estado global. |
| Domínio | `src/types/domain.ts` | Tipos partilhados: `ServiceRequest`, `Provider`, `Vehicle`, `Place`, `Transaction`, `ProviderDocument`… |
| Regras | `src/features` | Máquina de estados, preços, catálogo de serviços, passos do formulário, esquemas Zod, simulação. Funções puras e testadas. |
| Estado | `src/stores` | Zustand: sessão, rascunho do pedido, pedidos partilhados, prestador, chat, conta. |
| Dados | `src/services` | API simulada (`api/*.ts`) com latência e falhas configuráveis; hooks TanStack Query (`queries.ts`). |
| Mocks | `src/mocks` | Dados de exemplo e registo de imagens locais. |

## Fluxo de um pedido

1. O cliente escolhe o serviço (`startBooking`) e preenche os passos de `bookingSteps[kind]`; cada passo valida com o seu esquema e grava no `useBookingStore`.
2. Na estimativa, `useServiceStore.createFromDraft` valida o rascunho inteiro (`draftIssues`) e cria o `ServiceRequest` com `buildRequest` (distância, duração, preço, ganho e cronologia).
3. As transições passam sempre por `useServiceStore.transition`, que aplica `canTransition` e verifica o actor (`transitionActor`).
4. Cliente e prestador observam o mesmo objecto. `useClientSimulation` faz avançar os estados que, com backend, chegariam por notificação; `useStatusRoute` leva o cliente para o ecrã do estado actual (só no ecrã em foco).
5. O comprovativo (`submitProof`) credita o ganho em `useProviderStore`; o pagamento e a avaliação fecham o pedido.

## Trocar mocks por API

1. Implementar as funções de `src/services/api/*.ts` com o cliente HTTP (`src/services/http.ts`), mantendo as assinaturas.
2. Mover as mutações das stores (`createFromDraft`, `transition`, `accept`, `submitProposal`, `submitProof`, `pay`, `rate`, `withdraw`, `submitDocument`) para `useMutation` sobre a API e invalidar as chaves de `queryKeys`.
3. Substituir `useClientSimulation` por subscrições (push ou WebSocket) que actualizem a cache do TanStack Query.
4. Trocar `Photo.asset` por URLs remotos (o `PhotoTile` já usa `expo-image`) e eliminar `src/mocks/assets.ts`.
5. Ligar sessão a autenticação real (token em `expo-secure-store`) e localização a `expo-location`; os ecrãs de permissão já existem.
6. Em `MapPreview`, substituir `mockRoute` pela polilinha da API de rotas.

Os esquemas Zod de `src/features/*/schemas.ts` podem ser reutilizados para validar respostas da API.
