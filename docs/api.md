# API AngoLeva — contrato esperado pela app

Este documento descreve a API REST que a app consome, no formato exacto de fio.

| O quê | Onde |
| --- | --- |
| Esquemas do JSON (Zod; validam cada resposta) | `src/data/api/dto.ts` |
| Tradução JSON ↔ modelo da app | `src/data/api/mappers.ts` |
| Chamadas da app | `src/data/api/ApiRepositories.ts` |
| Exemplos reais de respostas | `src/data/api/__fixtures__/*.json` |
| API simulada (backend da fase mock) | `src/data/mock/server.ts` |

A API simulada responde a todos estes endpoints neste formato. Por omissão, a app já recebe os dados mockados assim e passa pelo mesmo caminho que vai usar com o backend real. É uma **especificação executável**: se o backend se comportar como ela, a app funciona sem alterações.

## Convenções

| Tema | Regra |
| --- | --- |
| URL base | `EXPO_PUBLIC_API_URL`, por exemplo `https://api.angoleva.ao/v1`. |
| Nomes | Campos em `snake_case`. Coordenadas em `lat`/`lng`. Valores monetários em kwanzas inteiros, com sufixo `_kz`. |
| Datas | ISO 8601 em UTC (`2026-10-27T09:15:00Z`). |
| Ausências | Campos opcionais vêm sempre presentes, com `null`. |
| Respostas | Um recurso vem em `{ "data": {...} }`. Uma lista vem em `{ "data": [...], "meta": { "count": n } }`. Sem corpo: `204 No Content`. |
| Erros | `{ "error": { "code": "invalid_transition", "message": "texto em pt-PT", "details"?: {...} } }`. A app mostra a `message`. |
| Autenticação | `Authorization: Bearer <access_token>` em todos os endpoints, menos nos marcados como públicos. |
| Cabeçalhos enviados | `Accept-Language: pt-PT`, `X-Client: angoleva-app/<android\|ios\|web>`, `X-Request-Id` (único por pedido). |
| Validação | A app valida cada resposta. Uma resposta fora do contrato vira erro `server` («Resposta inesperada do servidor») e não chega ao ecrã. Em desenvolvimento, a consola mostra o campo que falhou. |

### Estados HTTP e erros na app

| HTTP | `RepositoryError.code` | Quando |
| --- | --- | --- |
| 400, 422 | `validation` | Corpo fora do contrato ou regra violada (saldo insuficiente, cobertura vazia…). |
| 401 | `unauthorized` | Credenciais erradas, ou token expirado ou revogado. Com o token expirado (`code: "token_expired"`), a app renova-o com o refresh token e repete o pedido. Só se a renovação falhar termina a sessão e abre o login. |
| 403 | `forbidden` | Operação não permitida: recurso de outro utilizador, actor errado numa transição, prestador offline (ver «Regras de acesso»). |
| 404 | `not_found` | Recurso ou endpoint inexistente. |
| 409 | `invalid_transition` | Transição fora da máquina de estados do pedido. |
| 429, 5xx | `server` | Limite de pedidos ou erro do servidor. |
| sem resposta | `network` | Sem ligação ou tempo esgotado (`EXPO_PUBLIC_API_TIMEOUT_MS`). Os GET são repetidos uma vez, tal como os 502, 503 e 504. |

## Objectos

Os esquemas completos estão em `src/data/api/dto.ts`. Há um exemplo de cada um dos principais em `src/data/api/__fixtures__/`.

**`Client`**
```json
{ "id": "cli-armando", "full_name": "Armando Manuel", "email": "armando@email.com", "phone": "+244 923 456 789", "rating": 4.8, "avatar_url": null }
```

**`Provider`**
```json
{
  "id": "prv-paulo", "full_name": "Paulo Domingos", "phone": "+244 912 000 222", "rating": 4.9, "reviews_count": 212,
  "verified": true, "avatar_url": null, "location": { "lat": -8.8147, "lng": 13.2302 },
  "vehicle": { "id": "veh-paulo", "brand": "Isuzu", "model": "NPR Reboque", "plate": "LD-12-34-AB", "color": "Branco",
               "class": "tow_truck", "category_label": "Reboque plataforma", "capacity_kg": 3500, "year": 2021 }
}
```

**`Place`**
```json
{ "id": "plc-maianga", "label": "Largo da Maianga", "district": "Maianga", "city": "Luanda", "lat": -8.8256, "lng": 13.2311 }
```

**`ServiceRequest`:** ver o exemplo completo em `__fixtures__/service-request.json`. Campos principais:

| Grupo | Campos |
| --- | --- |
| Identificação | `id`, `code` (`AL-…`), `service_type` (`tow` \| `cargo` \| `small_move` \| `house_move`), `status` |
| Pessoas | `client_id`, `provider_id`, e os objectos `client` e `provider` incluídos |
| Trajecto | `pickup`, `dropoff`, `stops` (`Place`), `distance_km`, `duration_min`, `created_at`, `scheduled_for` |
| Detalhes por serviço | `tow_details`, `cargo_details`, `moving_details` (só o do tipo do pedido; os outros a `null`) |
| Fotografias e instruções | `photos`, `pickup_photos` (`{ id, url, caption }`), `instructions` |
| Preço | `pricing` `{ base_kz, distance_kz, extras_kz, platform_fee_kz, total_kz }`, `provider_earning_kz`, `proposal` `{ amount_kz, reason, status }` |
| Pagamento e fecho | `payment_method`, `rating`, `review`, `proof` `{ photos, signed_by, good_condition, notes, delivered_at }`, `cancel_reason` |
| Histórico | `timeline` `[{ status, at }]` |

**`ProviderState`**
```json
{
  "profile": { "...": "Provider" }, "online": true,
  "coverage": { "zone_ids": ["zone-luanda"], "service_types": ["tow", "cargo"] },
  "documents": [{ "id": "doc-license", "title": "Carta de condução", "kind": "license", "valid_until": "2027-05-01", "status": "verified" }],
  "wallet": { "balance_kz": 48500, "transactions": [{ "id": "tx-1", "type": "earning", "title": "Reboque · Maianga", "amount_kz": 11050,
              "created_at": "2026-10-27T10:00:00Z", "status": "completed", "service_type": "tow" }],
              "payout_account": { "bank": "BAI", "iban": "AO06 …", "holder": "João Manuel" } },
  "declined_request_ids": []
}
```

**`ChatMessage`**
```json
{ "id": "m-1", "thread_id": "req-30120", "sender": "provider", "body": "Estou a 5 minutos.", "sent_at": "2026-10-27T09:20:00Z", "read": false }
```

## Tempo real

Há três tópicos, e cada mensagem traz JSON no formato acima:

| Tópico | Mensagem |
| --- | --- |
| `requests` | `ServiceRequest` alterado |
| `providers/<id>` | `ProviderState` |
| `threads/<id>` | `{ "type": "message", "message": ChatMessage }` ou `{ "type": "typing", "sender": "provider", "typing": true }` |

**Transportes** (`src/data/api/realtime.ts`):

- **Polling** (API REST de hoje, a cada `EXPO_PUBLIC_POLL_INTERVAL_MS`):
  - `GET /requests/changes?since=<cursor>` e `GET /threads/:id/changes?since=<cursor>` devolvem `{ "data": [...], "meta": { "cursor": "<opaco>" } }`.
    - Sem `since`, `data` vem vazio e o cursor é o actual (é o ponto de partida).
    - Com `since`, vêm as alterações posteriores, cada uma uma só vez.
  - O estado do prestador é lido de `GET /providers/:id/state` e só é publicado quando muda.
  - Por polling não há «a escrever…».
- **WebSocket** (a fazer no backend): os mesmos tópicos e mensagens. A API simulada já se comporta assim (`server.socket`), incluindo «a escrever…».

## Autenticação

| Método | Caminho | Corpo | Resposta |
| --- | --- | --- | --- |
| POST | `/auth/login` (público) | `{ email, password, role: "client"\|"provider" }` | `{ data: Session }` |
| POST | `/auth/register` (público) | `{ full_name, email, phone, password }` | 204; envia o código por email |
| POST | `/auth/recover` (público) | `{ email }` | 204 |
| POST | `/auth/verify` (público) | `{ email, code, purpose: "register"\|"recover" }` | `{ data: Session }` |
| POST | `/auth/resend` (público) | `{ email }` | 204 |
| POST | `/auth/refresh` (público) | `{ refresh_token }` | `{ data: Session }`, com tokens novos; o refresh token antigo deixa de valer |
| GET | `/auth/me` | — | `{ data: { user: Client, provider_id } }` (retoma a sessão guardada) |
| POST | `/auth/password` | `{ current_password, new_password }` | 204 |
| POST | `/auth/logout` | — | 204; invalida o token |
| PATCH | `/clients/:id` | `{ full_name?, email?, phone? }` | `{ data: Client }` |

`Session` = `{ access_token, token_type: "Bearer", expires_in, refresh_token, user: Client, provider_id: string | null }` (ver `__fixtures__/session.json`). Os dois tokens ficam no armazenamento seguro do dispositivo.

**Renovação:**

- O token de acesso é curto (`expires_in`, em segundos).
- Quando um pedido recebe 401, a app chama `POST /auth/refresh` uma única vez, mesmo com vários pedidos a falhar em paralelo, e repete os pedidos. Guarda os tokens novos.
- No arranque, se `/auth/me` recusar o token guardado, a app tenta primeiro renovar.

## Regras de acesso

O servidor decide sempre com base no token. A API simulada aplica estas regras (`src/data/mock/server.ts`, testadas em `api-security.test.ts`):

| Recurso | Quem |
| --- | --- |
| `/clients/:id/…` | só o próprio cliente |
| `/providers/:id/…` | só o próprio prestador |
| `GET /requests` | sem filtro, só os pedidos do utilizador; `client_id`/`provider_id` têm de ser os dele |
| `GET /requests/:id`, `/threads/:id` | o cliente do pedido, o prestador atribuído e, enquanto está em `searching`, qualquer prestador |
| `…/changes` | só alterações de pedidos que o utilizador pode ver |
| `POST /requests` | `client_id` tem de ser o do utilizador |
| `transitions` | `actor: client` → o cliente do pedido; `actor: provider` → o prestador atribuído; `actor: system` → **nunca** vindo da app (só o servidor) |
| `accept`, `proposal` | `provider_id` tem de ser o do utilizador |
| `cancel` | o cliente ou o prestador atribuído |
| `proposal/answer`, `payment`, `rating` | o cliente do pedido |
| `pickup-photos`, `proof` | o prestador atribuído |

Em modo demonstração, a app simula os outros intervenientes (o prestador que aceita, o cliente que confirma a recolha), por isso a API simulada aceita aí `actor: system` e propostas em nome de prestadores simulados. Com `createMockServer(db, { simulation: false })` comporta-se como o backend real.

## Pedidos de serviço

| Método | Caminho | Corpo / parâmetros | Resposta |
| --- | --- | --- | --- |
| GET | `/requests` | `?client_id=&provider_id=&status=searching,assigned` | lista de `ServiceRequest` |
| GET | `/requests/changes` | `?since=` | alterações (ver «Tempo real») |
| GET | `/requests/:id` | — | `ServiceRequest` |
| POST | `/requests` | `{ service_type, client_id, pickup, dropoff, stops, scheduled_for, tow_details, cargo_details, moving_details, photos, instructions, payment_method }` | `201`, `ServiceRequest` em `searching` (o servidor calcula a distância, o preço e o código) |
| POST | `/requests/:id/transitions` | `{ to, actor: "client"\|"provider"\|"system" }` | `ServiceRequest` |
| POST | `/requests/:id/accept` | `{ provider_id }` | `ServiceRequest` |
| POST | `/requests/:id/cancel` | `{ reason }` | `ServiceRequest` |
| POST | `/requests/:id/proposal` | `{ provider_id, amount_kz, reason }` | `ServiceRequest` |
| POST | `/requests/:id/proposal/answer` | `{ accepted }` | `ServiceRequest` |
| POST | `/requests/:id/pickup-photos` | `{ photos: [{ id, url, caption }] }` | `ServiceRequest` |
| POST | `/requests/:id/proof` | `{ photos, signed_by, good_condition, notes }` | `ServiceRequest` (`delivered`; credita o ganho) |
| POST | `/requests/:id/payment` | `{ payment_method: "bank_reference"\|"card"\|"cash" }` | `ServiceRequest` (`paid`) |
| POST | `/requests/:id/rating` | `{ rating: 1–5, review }` | `ServiceRequest` (`rated`) |

**Regras que o servidor tem de garantir** (hoje estão nos serviços mock, `src/data/mock/Mock*Repository.ts`):

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
| GET | `/providers/:id/state` | — | `ProviderState` |
| GET | `/providers/:id/nearby-requests` | — | lista de `{ request: ServiceRequest, distance_km }`: pedidos em `searching` compatíveis com a cobertura e não recusados |
| PUT | `/providers/:id/availability` | `{ online }` | 204 |
| PATCH | `/providers/:id/vehicle` | campos de `vehicle`, sem `id` | `Vehicle` |
| GET | `/zones` | — | lista de `{ id, name, lat, lng, radius_km }` |
| PUT | `/providers/:id/coverage` | `{ zone_ids, service_types }` | a cobertura gravada; 422 se uma das listas vier vazia |
| POST | `/providers/:id/documents/:documentId` | — (o ficheiro vai para `/uploads`) | o documento em `pending`; o servidor valida depois e publica em `providers/<id>` |
| POST | `/providers/:id/declined` | `{ request_id }` | 204 |
| POST | `/providers/:id/withdrawals` | `{ amount_kz }` | transacção em `pending`; 422 se o valor for acima do saldo |
| GET | `/providers/:id/earnings` | — | `{ today_kz, today_count, week_kz, completed_count, last_7_days_kz: number[7] }` |
| GET | `/providers/:id/reviews` | — | lista de `{ id, request_id, author_name, rating, comment, created_at }` |

## Localização

| Método | Caminho | Parâmetros | Resposta |
| --- | --- | --- | --- |
| GET | `/locations/current` | — | `Place`: posição aproximada (sem GPS autorizado) |
| GET | `/locations/reverse` | `?lat=&lng=` | `Place`: morada ou bairro mais próximo das coordenadas do GPS |
| GET | `/locations/search` | `?q=` | lista de `Place` |
| GET | `/locations/areas` | — | lista de `Place` (bairros) |
| GET | `/vehicles/nearby` | `?lat=&lng=` | lista de `{ id, lat, lng, type: "tow"\|"cargo"\|"move" }` |

A distância por estrada é estimada na app (`utils/geo.ts`) só para pré-visualização. O valor oficial é sempre o que vem no pedido.

## Chat

| Método | Caminho | Corpo / parâmetros | Resposta |
| --- | --- | --- | --- |
| GET | `/threads/:id/messages` | `?kind=service\|support` | lista de `ChatMessage` |
| GET | `/threads/:id/changes` | `?since=` | alterações (mensagens) |
| POST | `/threads/:id/messages` | `{ sender, body }` | `201`, `ChatMessage` |
| POST | `/threads/:id/read` | `{ reader }` | 204 |

`:id` é o id do pedido (conversa cliente↔prestador) ou `support-client` / `support-provider`.

## Conta do cliente

| Método | Caminho | Corpo | Resposta |
| --- | --- | --- | --- |
| GET | `/clients/:id/addresses` | — | lista de `{ id, label, icon: "home"\|"work"\|"pin", place }` |
| POST | `/clients/:id/addresses` | `{ label, icon, place }` | `201`, a morada criada |
| DELETE | `/clients/:id/addresses/:addressId` | — | 204 |
| GET | `/clients/:id/payment-methods` | — | lista de `{ id, type, title, detail, is_default }` |
| PUT | `/clients/:id/payment-methods/default` | `{ payment_method_id }` | a lista actualizada |
| POST | `/clients/:id/payment-methods` | `{ type: "card", last4 }` (na integração real: token do processador, nunca o número) | `201`, o método criado |

## Suporte e segurança

| Método | Caminho | Corpo / parâmetros | Resposta |
| --- | --- | --- | --- |
| GET | `/help` | `?q=&category=` | lista de `{ id, category, question, answer }` |
| GET | `/help/emergency-contacts` | — | lista de `{ id, label, phone_number }` |
| POST | `/tickets` | `{ request_id, reason, description }` (descrição com 10 ou mais caracteres) | `201`, `{ code }` (ex.: `OC-1234`) |
| POST | `/sos` | `{ request_id, lat, lng }` | 204 |

## Ficheiros

| Método | Caminho | Corpo | Resposta |
| --- | --- | --- | --- |
| POST | `/uploads` | `multipart/form-data`: `file` (imagem) e `context` (`cargo` \| `vehicle` \| `delivery` \| `document`) | `201`, `{ data: { id, url, content_type } }`; 422 se faltar o ficheiro ou se não for uma imagem |

A app tira a foto (câmara ou, sem câmara, galeria; `src/data/device/DeviceCamera.ts`) e envia-a. O `url` devolvido é o que vai nos pedidos (`photos[].url`). Na demonstração (`EXPO_PUBLIC_CAMERA=simulated`), as fotos são imagens de exemplo empacotadas, referidas por chave; o `imageSource` aceita as duas formas.

## Ainda por integrar

- **WebSocket:** mesmos tópicos e mensagens que o socket da API simulada.
- **Notificações push:** registo do token Expo e envio pelo servidor.
- **Pagamentos reais:** Multicaixa Express, referência bancária e cartão via processador.
