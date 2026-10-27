# API AngoLeva — contrato esperado pela app

Este documento descreve a API REST que a app consome. A implementação do lado da app está em `src/data/http/HttpRepositories.ts`. A API simulada (`src/data/mock/server.ts`) responde a estes endpoints e serve de **especificação executável**: se o backend se comportar como ela, a app funciona sem alterações.

Os tipos referidos (`ServiceRequest`, `Provider`, `ChatMessage`…) estão em `src/types/domain.ts` e nos contratos de `src/data/repositories/`.

## Convenções

| Tema | Regra |
| --- | --- |
| URL base | `EXPO_PUBLIC_API_URL`, por exemplo `https://api.angoleva.ao/v1`. |
| Formato | JSON em UTF-8. As datas vêm em ISO 8601 (UTC) e os valores em kwanzas inteiros. |
| Autenticação | `Authorization: Bearer <token>` em todos os endpoints, menos nos de `/auth` marcados como públicos. |
| Cabeçalhos enviados | `Accept-Language: pt-PT`, `X-Client: angoleva-app/<android\|ios\|web>`, `X-Request-Id` (único por pedido, para cruzar registos). |
| Erros | Corpo `{ "message": "texto para o utilizador em pt-PT", "code": "opcional" }`. A app mostra a `message`. |
| Respostas sem corpo | `204 No Content`. |
| Pedidos dentro de pedidos | Cada `ServiceRequest` devolvido inclui os objectos `client` e `provider` (quando há prestador). |

### Estados HTTP e erros na app

| HTTP | `RepositoryError.code` | Quando |
| --- | --- | --- |
| 400, 422 | `validation` | Dados inválidos (campos, valores fora de limites, saldo insuficiente…). |
| 401 | `unauthorized` | Credenciais erradas, ou token expirado ou revogado. Se o pedido levava token, a app termina a sessão e abre o login. |
| 403 | `forbidden` | O utilizador não pode fazer a operação (ex.: transição feita pelo actor errado, prestador offline). |
| 404 | `not_found` | Recurso inexistente. |
| 409 | `invalid_transition` | Transição fora da máquina de estados do pedido. |
| 429, 5xx | `server` | Limite de pedidos ou erro do servidor. |
| sem resposta | `network` | Sem ligação ou tempo esgotado (`EXPO_PUBLIC_API_TIMEOUT_MS`). Os GET são repetidos uma vez, tal como os 502, 503 e 504. |

### Tempo real

Até existir WebSocket, a app faz polling a cada `EXPO_PUBLIC_POLL_INTERVAL_MS`:

- **`GET …/changes?since=<cursor>`** devolve `{ "items": [...], "cursor": "<opaco>" }`.
  - Sem `since`, devolve `items: []` e o cursor actual (é o ponto de partida).
  - Com `since`, devolve as alterações posteriores, cada uma uma só vez.
  - O cursor é opaco para a app: pode ser um número de sequência, um timestamp ou um id.
- **Estado do prestador:** a app lê `GET /providers/:id/state` em ciclo e só actualiza quando a resposta muda.

## Autenticação

| Método | Caminho | Corpo | Resposta |
| --- | --- | --- | --- |
| POST | `/auth/login` (público) | `{ email, password, role: "client"\|"provider" }` | `Session` = `{ token, user: Client, providerId? }` |
| POST | `/auth/register` (público) | `{ name, email, phone, password }` | 204; envia o código por email |
| POST | `/auth/recover` (público) | `{ email }` | 204 |
| POST | `/auth/verify` (público) | `{ email, code, purpose: "register"\|"recover" }` | `Session` |
| POST | `/auth/resend` (público) | `{ email }` | 204 |
| GET | `/auth/me` | — | `{ user: Client, providerId? }` (retoma a sessão guardada) |
| POST | `/auth/password` | `{ current, next }` | 204 |
| POST | `/auth/logout` | — | 204; invalida o token |
| PATCH | `/clients/:id` | `{ name?, email?, phone? }` | `Client` |

O token é guardado no armazenamento seguro do dispositivo (`EXPO_PUBLIC_SECURE_STORAGE=device`).

## Pedidos de serviço

| Método | Caminho | Corpo / parâmetros | Resposta |
| --- | --- | --- | --- |
| GET | `/requests` | `?clientId=&providerId=&status[]=` | `ServiceRequest[]` |
| GET | `/requests/changes` | `?since=` | `ChangesPage<ServiceRequest>` |
| GET | `/requests/:id` | — | `ServiceRequest` |
| POST | `/requests` | `RequestInput` sem `id` e sem `status` (ver `features/booking/factory.ts`) | `201 ServiceRequest` (`status: "searching"`) |
| POST | `/requests/:id/transitions` | `{ to: ServiceStatus, actor: "client"\|"provider"\|"system" }` | `ServiceRequest` |
| POST | `/requests/:id/accept` | `{ providerId }` | `ServiceRequest` |
| POST | `/requests/:id/cancel` | `{ reason }` | `ServiceRequest` |
| POST | `/requests/:id/proposal` | `{ providerId, amount, reason }` | `ServiceRequest` |
| POST | `/requests/:id/proposal/answer` | `{ accepted: boolean }` | `ServiceRequest` |
| POST | `/requests/:id/pickup-photos` | `{ photos: Photo[] }` | `ServiceRequest` |
| POST | `/requests/:id/proof` | `{ photos, signedBy, goodCondition, notes? }` | `ServiceRequest` (`delivered`; credita o ganho) |
| POST | `/requests/:id/payment` | `{ method: "bank_reference"\|"card"\|"cash" }` | `ServiceRequest` (`paid`) |
| POST | `/requests/:id/rating` | `{ rating: 1–5, review? }` | `ServiceRequest` (`rated`) |

**Regras que o servidor tem de garantir** (hoje estão na implementação mock):

- **Máquina de estados:** `searching → assigned → en_route → arrived → pickup_confirmed → in_transit → delivered → paid → rated`.
  - Cancelar só é possível em `searching`, `assigned`, `en_route` e `arrived`.
  - Qualquer outra transição dá 409.
- **Actor de cada transição** (actor errado dá 403):
  - `provider`: `assigned`, `en_route`, `arrived`, `in_transit` e `delivered`;
  - `client`: `pickup_confirmed`, `paid` e `rated`.
- **Aceitar um pedido** exige o prestador online.
- **Proposta de preço:** o pedido tem de estar em `searching` (a app só a oferece em mudanças de casa). O cliente aceita, e o pedido fica atribuído a esse prestador, ou recusa, e o pedido volta a ficar livre.
- **Preço:** base mais distância mais extras, arredondado a 500 Kz, mais a taxa da plataforma de 500 Kz. O ganho do prestador é o valor do serviço menos 15 %. Ver `features/booking/pricing.ts`.

## Prestador

| Método | Caminho | Corpo | Resposta |
| --- | --- | --- | --- |
| GET | `/providers/:id/state` | — | `ProviderState` = `{ profile, online, coverage, documents, wallet, declined }` |
| GET | `/providers/:id/nearby-requests` | — | `{ request: ServiceRequest, distanceKm }[]`: pedidos em `searching` compatíveis com a cobertura e não recusados |
| PUT | `/providers/:id/availability` | `{ online }` | 204 |
| PATCH | `/providers/:id/vehicle` | `Partial<Vehicle>` | `Vehicle` |
| GET | `/zones` | — | `Zone[]` |
| PUT | `/providers/:id/coverage` | `{ zones: string[], services: ServiceKind[] }` | `Coverage`; 422 se uma das listas vier vazia |
| POST | `/providers/:id/documents/:documentId` | — (o ficheiro vai para `/uploads`) | `ProviderDocument` (`pending`; o servidor valida depois) |
| POST | `/providers/:id/declined` | `{ requestId }` | 204 |
| POST | `/providers/:id/withdrawals` | `{ amount }` | `Transaction` (`pending`); 422 se o valor for acima do saldo |
| GET | `/providers/:id/earnings` | — | `{ today, todayCount, week, completed, chart: number[7] }` |
| GET | `/providers/:id/reviews` | — | `Review[]` |

## Localização

| Método | Caminho | Parâmetros | Resposta |
| --- | --- | --- | --- |
| GET | `/locations/current` | — | `Place` (no futuro vem do GPS do dispositivo e de geocodificação inversa) |
| GET | `/locations/search` | `?q=` | `Place[]` |
| GET | `/locations/areas` | — | `Place[]` (bairros) |
| GET | `/vehicles/nearby` | `?latitude=&longitude=` | `{ id, coords, kind: "tow"\|"cargo"\|"move" }[]` |

A distância por estrada é estimada na app (`utils/geo.ts`). O valor oficial do preço é sempre o que o servidor devolve no pedido.

## Chat

| Método | Caminho | Corpo / parâmetros | Resposta |
| --- | --- | --- | --- |
| GET | `/threads/:id/messages` | `?kind=service\|support` | `ChatMessage[]` |
| GET | `/threads/:id/changes` | `?since=` | `ChangesPage<ChatMessage>` |
| POST | `/threads/:id/messages` | `{ from, text }` | `ChatMessage` |
| POST | `/threads/:id/read` | `{ reader }` | 204 |

`:id` é o id do pedido (conversa cliente↔prestador) ou `support-client` / `support-provider`. O indicador «a escrever…» só aparece quando houver WebSocket.

## Conta do cliente

| Método | Caminho | Corpo | Resposta |
| --- | --- | --- | --- |
| GET | `/clients/:id/addresses` | — | `SavedAddress[]` |
| POST | `/clients/:id/addresses` | `{ label, place, icon }` | `SavedAddress` |
| DELETE | `/clients/:id/addresses/:addressId` | — | 204 |
| GET | `/clients/:id/payment-methods` | — | `PaymentMethod[]` |
| PUT | `/clients/:id/payment-methods/default` | `{ id }` | `PaymentMethod[]` |
| POST | `/clients/:id/payment-methods` | `{ last4 }` (na integração real: token do processador, nunca o número) | `PaymentMethod` |

## Suporte e segurança

| Método | Caminho | Corpo / parâmetros | Resposta |
| --- | --- | --- | --- |
| GET | `/help` | `?q=&category=` | `HelpTopic[]` |
| GET | `/help/emergency-contacts` | — | `{ id, label, number }[]` |
| POST | `/tickets` | `{ requestId, reason, description }` (descrição com 10 ou mais caracteres) | `{ code }` (ex.: `OC-1234`) |
| POST | `/sos` | `{ requestId?, coords }` | 204 |

## Ainda por integrar

- **Fotografias:** captura com `expo-image-picker` e envio para `POST /uploads`, que devolve o URL. `Photo.asset` passa a URL, e o `imageSource` já aceita URLs. Até lá, em modo HTTP as fotos continuam a ser as de exemplo.
- **Tempo real por WebSocket:** substitui `…/changes` e activa o «a escrever…».
- **Notificações push:** registo do token Expo e envio pelo servidor.
- **Pagamentos reais:** Multicaixa Express, referência bancária e cartão via processador.
- **Renovação de token** (refresh token). Hoje, um 401 termina a sessão.
- **Permissões por recurso:** um cliente só vê os seus pedidos e um prestador só altera o seu estado. A API simulada não verifica isto.
