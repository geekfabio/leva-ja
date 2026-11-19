# AngoLeva

Aplicação mobile de assistência, transporte e logística em Luanda: reboque de viaturas, transporte de carga com pickup, pequenas mudanças e mudanças completas de casa. Tem dois perfis — **Cliente** e **Prestador de Serviço** — e fala sempre com a API real (`EXPO_PUBLIC_API_URL`): pedidos, preços, prestadores e zonas vêm da base de dados.

O projecto chamava-se **Leva Já**. Com a mudança para AngoLeva passaram a ser `angoleva`: o nome do pacote npm, o slug Expo, o esquema de links (`angoleva://`), os identificadores Android/iOS (`ao.angoleva.app`), as chaves do armazenamento seguro (`angoleva.*`), o domínio de demonstração (`@angoleva.ao`) e o prefixo dos códigos de pedido (`AL-`). O repositório GitHub mantém o nome `leva-ja`.

A interface segue as 46 referências documentadas em [docs/ui-reference.md](docs/ui-reference.md), adaptadas a Android e iOS (e à web, para revisão).

## Começar

```bash
npm install
npx expo start            # development build (script "start" usa --dev-client)
npx expo start --go       # Expo Go
npx expo start --web      # pré-visualização no browser (mapa OpenStreetMap)
```

Fluxo de entrada: **splash → onboarding → escolha de perfil → login**. A conta é criada na API; o código de confirmação (OTP) chega por SMS/e-mail. Enquanto não houver fornecedor configurado, a API usa um código fixo definido em `OTP_FIXED_CODE` (ver `api/README.md`).

Antes de arrancar, define `EXPO_PUBLIC_API_URL` num `.env` (ver `.env.example`).

### Verificações

```bash
npm run typecheck   # TypeScript
npm run lint        # ESLint (eslint-config-expo)
npm test            # Jest: lógica de negócio, API (contrato, segurança, tempo real, pagamentos…), stores e ecrãs
npm run test:e2e    # Playwright: gera o build web e percorre a app no browser
```

A suite E2E (`e2e/`) abre todas as rotas e verifica que nenhuma dá erro. Corre também três percursos completos. Nos testes (e só neles, `EXPO_PUBLIC_E2E=1`) a API é um servidor falso em memória, em `src/__test-support__/`, que o Metro exclui das builds de produção:

- a entrada na app (onboarding, login e localização);
- o pedido do cliente até ao recibo, com o pagamento por referência Multicaixa confirmado pelo «banco»;
- o serviço do prestador até o ganho chegar à carteira pelo tempo real.

Usa o Chromium já instalado pelo Playwright (`@playwright/test` 1.56.1).

## Stack

React Native 0.81 + Expo 54 + TypeScript · Expo Router · NativeWind · Zustand · TanStack Query · React Hook Form + Zod · React Native Paper · Lucide · Reanimated + Gesture Handler · @gorhom/bottom-sheet · expo-image · react-native-maps · Plus Jakarta Sans.

## Estrutura

```
src/
  app/                    Rotas (Expo Router; a raiz do projecto já era src/app)
    index.tsx             01 Splash
    (auth)/               02–10 Onboarding, perfil, login, registo, recuperação, email, localização
    (client)/             11–33 Separadores do cliente, pedido (booking/), acompanhamento (trip/), conta e suporte
    (provider)/partner/   34–46 Separadores do prestador, pedido, serviço activo, proposta, comprovativo, gestão
  components/
    kit.ts                Ponto de entrada da biblioteca de componentes
    core/                 Texto, botões, ScreenContainer, AppHeader, BottomAction, campos, estados, folhas, diálogos
    service/              ServiceCard, StatusBadge, PriceSummary, ServiceTimeline, ContactActions, OrderCard, DeliveryProof, chat, chamada
    partner/              ProviderMetric, DocumentStatus, EarningsChart, TransactionRow, cabeçalhos do prestador
    map/                  MapPreview (react-native-maps no nativo, SVG na web/testes)
    ui/AppToast.tsx       Aspecto dos toasts
  data/                   Padrão Repository: contratos, implementação mock, implementação HTTP e contentor
  features/               Lógica de negócio: máquina de estados, preços, catálogo, esquemas Zod, simulação
  mocks/                  Sementes de demonstração (só usadas por data/mock)
  services/queries.ts     Hooks TanStack Query sobre os repositórios
  stores/                 Zustand: cache dos repositórios + sessão, rascunho do pedido e preferências
  theme/                  Cores, fontes, tema do Paper e registo de imagens empacotadas
  types/domain.ts         Modelo de domínio partilhado por mocks e futura API
  utils/                  Formatação pt-PT (Kz, datas), geo e trajectos simulados
```

### Dados: padrão Repository

Os ecrãs e as stores nunca importam mocks: falam com repositórios (`src/data`). Cada repositório tem um contrato (`AuthRepository`, `RequestRepository`, `ProviderRepository`, `LocationRepository`, `ChatRepository`, `AccountRepository`, `SupportRepository`, `MediaRepository`). A implementação é sempre a da API (`src/data/api`): recebe JSON no formato do backend (`snake_case`, envelopes `{ data }`), valida-o com Zod e converte-o para o domínio com mappers.

- **Produção e desenvolvimento**: o backend real em `EXPO_PUBLIC_API_URL`; o tempo real chega por WebSocket (`EXPO_PUBLIC_REALTIME_URL`) e, sem ele, por polling.
- **Testes**: Jest e Playwright injectam um servidor falso em memória (`src/__test-support__/`, `installTestBackend()`). O Metro substitui qualquer import desse caminho por um módulo vazio, por isso nenhuma build de produção o inclui.

A configuração está em `.env` (copiar de [.env.example](.env.example)). O contrato que o backend tem de cumprir está em [docs/api.md](docs/api.md).

A sessão (token e perfil) e o fim do onboarding ficam no **armazenamento seguro** (`SecureStorage` + `SessionVault`), retomados no splash: `expo-secure-store` (Keychain/Keystore) no Android e iOS e `localStorage` na web.

Detalhes, regras e passos para ligar a API em [docs/arquitectura.md](docs/arquitectura.md).

## Mapa de ecrãs

| Ref. | Ecrã | Rota |
| --- | --- | --- |
| 01 | Splash | `/` |
| 02–04 | Onboarding | `/intro` |
| 05 | Escolha de perfil | `/profile-select` |
| 06 | Login | `/login` |
| 07 | Criar conta (1 e 2 de 2) | `/register`, `/register-security` |
| 08 | Recuperar acesso | `/recover` |
| 09 | Confirmar email | `/verify-email` |
| 10 | Activar localização | `/enable-location` |
| 11 | Início do cliente | `/home` |
| 12 | O que precisas transportar? | `/services` |
| 13 | Reboque: problema | `/booking/incident` |
| 14 | Reboque: dados da viatura | `/booking/vehicle` |
| 15 | Carga: tipo, peso, volume, pickup, ajudante | `/booking/cargo` |
| 16 | Mudança: imóvel, divisões, mobília, ajudantes, pisos, elevador | `/booking/moving` |
| 17 | Mudança: data, hora e desmontagem | `/booking/schedule` |
| 18 | Fotos e instruções | `/booking/photos` |
| 19 | Trajecto | `/booking/route` |
| 20 | Estimativa e confirmação | `/booking/estimate` |
| 21 | A procurar prestador (e proposta nas mudanças de casa) | `/trip/matching` |
| 22 | Prestador encontrado | `/trip/found` |
| 23 | Acompanhamento no mapa | `/trip/tracking` |
| 24 | Chat | `/trip/chat` |
| 25 | Chamada | `/trip/call` |
| 26 | O prestador chegou | `/trip/arrived` |
| 27 | Confirmar recolha | `/trip/pickup` |
| 28 | Em transporte | `/trip/in-transit` |
| 29 | Serviço concluído e pagamento | `/trip/payment` |
| 30 | Recibo e avaliação | `/trip/receipt` (`?id=` para o histórico) |
| 31 | Perfil do cliente | `/account` |
| 32 | Definições | `/settings`, `/settings/[section]` |
| 33 | Ajuda e suporte | `/help`, `/help/faq`, `/help/chat`, `/help/report`, `/sos` |
| 34 | Painel do prestador | `/partner` |
| 35 | Novo pedido | `/partner/request/[id]` |
| 36 | Serviço em curso | `/partner/active/[id]` |
| 37 | Pedidos com filtros | `/partner/requests` |
| 38 | Ganhos | `/partner/earnings` |
| 39 | Transacções | `/partner/transactions` |
| 40 | Histórico e avaliações | `/partner/history` |
| 41 | Perfil profissional | `/partner/profile` |
| 42 | A minha viatura | `/partner/vehicle` |
| 43 | Documentos | `/partner/documents` |
| 44 | Zonas e serviços | `/partner/zones` |
| 45 | Propor valor | `/partner/proposal/[id]` |
| 46 | Comprovativo de entrega | `/partner/proof/[id]` |

Ecrãs de apoio: `/trips` (as minhas viagens), `/alerts` (notificações do cliente e do prestador), `/addresses`, `/payment-methods`, `/edit-profile`, `/settings/password`, `/partner/chat/[id]`, `/partner/call/[id]`.

## Funcionalidades mockadas

**Pedido dinâmico.** O formulário só mostra os passos do serviço escolhido e valida cada passo com Zod:

- Reboque: incidente → viatura (marca, modelo, matrícula `LD-12-34-AB`, cor, se se desloca) → trajecto → fotos.
- Carga (e entrega de mercadoria): tipo, descrição, peso, volume, pickup/carrinha/camião, ajudante → trajecto → fotos.
- Mudança pequena / de casa: tipo de imóvel e divisões (só casa), mobília, ajudantes, pisos, elevador → data e desmontagem → trajecto → fotos.

O preço vem do servidor (`POST /pricing/estimate`): distância, extras, taxa e ganho do prestador são calculados na API, com as tarifas e zonas da base de dados.

**Estados do serviço.** `features/service/stateMachine.ts` define o fluxo partilhado: a procurar → atribuído → a caminho → no local → recolha confirmada → em transporte → entregue → pago → avaliado (cancelamento só antes da recolha). Cada transição tem um actor (cliente, prestador ou sistema) e fica registada na cronologia do pedido.

**Sem simulação.** Os estados do pedido avançam por acção do prestador, do cliente ou do painel, nunca sozinhos. A posição, a câmara e as notificações vêm sempre do dispositivo. O pagamento é só em numerário, entregue ao prestador.

**Imagens.** As ilustrações, fotos de carga/entrega, a Hilux e os retratos de João Manuel e Armando Manuel são recortes das próprias referências (`assets/illustrations`, `assets/photos`, `assets/avatars`); as viaturas 3D vêm de `assets/vehicles/fleet-3d.png`, separadas em ficheiros individuais.

## Mapa

`MapPreview` usa `react-native-maps` no Android e iOS e mosaicos OpenStreetMap na web (`EXPO_PUBLIC_MAP_TILES_URL`). Trajecto e tempo estimado vêm de um serviço OSRM (`EXPO_PUBLIC_ROUTING_URL`); se falhar, a app mostra a linha recta e uma estimativa aproximada. Os prestadores e os pedidos próximos aparecem nas coordenadas reais da API.

Passos manuais: no Android, uma build de produção precisa de uma chave Google Maps (`android.config.googleMaps.apiKey` no `app.json`, criada na consola Google Cloud e restringida ao pacote `ao.angoleva.app`); sem ela o mapa fica em branco. Os servidores públicos do OSM e do OSRM não servem tráfego de produção: aponta as duas variáveis para um fornecedor próprio.

## Animações

Primitivas em `src/components/core/Motion.tsx` (Reanimated 4), com durações e molas partilhadas (`motion`):

- **Troca de ecrãs** (`src/components/core/ScreenTransitions.tsx`): avançar num fluxo desliza da direita, com gesto de voltar; mudar de área (splash, acesso, cliente, prestador) e os ecrãs do acompanhamento esbatem; SOS e detalhes sobem do fundo; separadores deslizam e esbatem ("shift"). Na web, onde a pilha nativa não anima, cada ecrã novo entra com uma animação equivalente.
- **Entradas:** `Appear` faz deslizar e aparecer blocos e itens de lista em sequência (passos do pedido, folhas do acompanhamento, listas de serviços, pedidos, transacções, documentos, perfil e ajuda).
- **Toque:** `ScalePressable` encolhe ligeiramente botões, cartões, opções e ícones ao toque.
- **Valores:** `AnimatedAmount` conta até ao valor (estimativa, total a pagar, ganho, saldo); `useBump` faz saltar contadores (pisos, ajudantes, segundos finais).
- **Progresso:** barras "x de y" e linha temporal do serviço preenchem-se; o passo activo pulsa; os pontos do onboarding alargam-se em pílula; o separador activo entra com mola.
- **Mapa e estados:** ondas de radar na procura (também sobre o mapa nativo), viatura a deslizar no mapa ilustrativo, anel de contagem contínuo, visto de sucesso com raios, anel a pulsar na chamada, bolhas do chat e indicador "a escrever…", transição suave entre ecrãs do acompanhamento.

Todas respeitam «reduzir movimento» do sistema e a opção em Definições → Acessibilidade: nesses casos os valores finais aparecem de imediato.

## Acessibilidade e responsividade

- Texto em Plus Jakarta Sans por família de peso, com escala do sistema limitada a 1,6×.
- Botões com altura mínima de 48–56 pt, áreas de toque de 44 pt, papéis e estados (`radio`, `checkbox`, `switch`, `tab`, `progressbar`, `timer`) para leitores de ecrã.
- Estados de carregamento (esqueletos), vazio, erro com repetição e sucesso em todas as listas assíncronas.
- Verde de acção `#0A8743` com texto branco (contraste 4,6:1); o verde vivo das referências `#12A150` é usado só em elementos sem texto.
- Na web a área da app fica limitada a 520 px.

## Protótipo anterior (removido)

O protótipo anterior (separadores `/legacy`, fluxos `request/`, `transport/`, `order/`, parceiro em `/provider/*`, administração em `/admin`, `/demo`, `/ui-kit`) e as rotas de e-commerce (`cart`, `checkout`, `category`, `merchant`, `product`, `search`) foram removidos. Continuam no histórico git, antes do commit «chore: remover protótipo anterior».

## Limites conhecidos

- A revisão visual e os testes E2E correm no browser (Playwright, 390 × 844). As builds Android e iOS foram exportadas mas não testadas em dispositivo. GPS, câmara, notificações push e WebSocket reais estão testados com módulos simulados e precisam de validação num telemóvel — ver [design-qa.md](design-qa.md).
- As notificações push reais precisam de `extra.eas.projectId` no `app.json` (projecto EAS) e de uma development build; no Expo Go não há push remoto.
- Só há pagamento em numerário; Multicaixa e cartão ficam para mais tarde.
