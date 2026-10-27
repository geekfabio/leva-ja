# AngoLeva

Aplicação mobile de assistência, transporte e logística em Luanda: reboque de viaturas, transporte de carga com pickup, pequenas mudanças e mudanças completas de casa. Tem dois perfis — **Cliente** e **Prestador de Serviço** — e, nesta fase, funciona inteiramente com dados mockados, sem backend.

O projecto chamava-se **Leva Já**. Com a mudança para AngoLeva passaram a ser `angoleva`: o nome do pacote npm, o slug Expo, o esquema de links (`angoleva://`), os identificadores Android/iOS (`ao.angoleva.app`), as chaves do armazenamento seguro (`angoleva.*`), o domínio de demonstração (`@angoleva.ao`) e o prefixo dos códigos de pedido (`AL-`). O repositório GitHub mantém o nome `leva-ja`.

A interface segue as 46 referências documentadas em [docs/ui-reference.md](docs/ui-reference.md), adaptadas a Android e iOS (e à web, para revisão).

## Começar

```bash
npm install
npx expo start            # development build (script "start" usa --dev-client)
npx expo start --go       # Expo Go
npx expo start --web      # pré-visualização no browser (mapa ilustrativo em SVG)
```

Fluxo de entrada: **splash → onboarding → escolha de perfil → login**. Os acessos são locais:

| Perfil | Como entrar | Dados |
| --- | --- | --- |
| Cliente | Escolhe «Preciso de um serviço» e entra | `armando@email.com` + qualquer palavra-passe com 6+ caracteres |
| Prestador | Escolhe «Sou prestador» e entra | `joao.manuel@angoleva.ao` + qualquer palavra-passe com 6+ caracteres |
| Registo / recuperação | «Criar conta» ou «Esqueci-me da palavra-passe» | Código de confirmação `123456` |

Atalho: no perfil de cada área existe «Mudar para prestador/cliente».

### Verificações

```bash
npm run typecheck   # TypeScript
npm run lint        # ESLint (eslint-config-expo)
npm test            # Jest: lógica de negócio, stores, kit e fluxos
```

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

- **mock** (por omissão): quem responde é uma **API simulada dentro da app** (`src/data/mock/server.ts`), sobre dados de demonstração. Simula latência, erros, falhas de rede e tempo real por socket.
- **http**: o backend real em `EXPO_PUBLIC_API_URL` (`EXPO_PUBLIC_DATA_SOURCE=http`), com tempo real por polling até haver WebSocket.

A configuração está em `.env` (copiar de [.env.example](.env.example)). O contrato que o backend tem de cumprir está em [docs/api.md](docs/api.md).

A sessão (token e perfil) e o fim do onboarding ficam no **armazenamento seguro** (`SecureStorage` + `SessionVault`), retomados no splash. Por omissão é um SecureStore simulado em memória; com `EXPO_PUBLIC_SECURE_STORAGE=device` passa a usar o `expo-secure-store` (Keychain/Keystore) no Android e iOS.

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

A estimativa (`features/booking/pricing.ts`) soma base, distância e extras, arredonda a 500 Kz e acrescenta 500 Kz de taxa; o ganho do prestador desconta 15% de comissão.

**Estados do serviço.** `features/service/stateMachine.ts` define o fluxo partilhado: a procurar → atribuído → a caminho → no local → recolha confirmada → em transporte → entregue → pago → avaliado (cancelamento só antes da recolha). Cada transição tem um actor (cliente, prestador ou sistema) e fica registada na cronologia do pedido.

**Simulação.** Do lado do cliente, os estados que viriam do servidor avançam sozinhos (prestador atribuído em ~4 s, chegada ~15 s, entrega ~15 s). Nas mudanças de casa, o prestador simulado envia uma proposta que o cliente aceita ou recusa. Em **Definições → Demonstração** é possível:

- desligar o avanço automático e conduzir o mesmo pedido pela área do prestador (aceitar, deslocar, registar fotos, transportar, comprovativo);
- simular falhas de rede para ver os estados de erro das listas;
- repor os dados de demonstração.

**Sem integrações reais.** Pagamentos (referência Multicaixa, cartão, numerário), localização (posição fixa em Luanda), chamadas, chat (respostas automáticas), câmara (fotos de exemplo), assinatura (desenhada mas não enviada), documentos, levantamentos e notificações são simulados. Nenhum dado sai do dispositivo e a sessão reinicia ao fechar a app.

**Imagens.** As ilustrações, fotos de carga/entrega, a Hilux e os retratos de João Manuel e Armando Manuel são recortes das próprias referências (`assets/illustrations`, `assets/photos`, `assets/avatars`); as viaturas 3D vêm de `assets/vehicles/fleet-3d.png`, separadas em ficheiros individuais.

## Mapa

`MapPreview` usa `react-native-maps` no Android e iOS, com marcadores, trajecto simulado e zonas mockadas. Na web, nos testes ou com `EXPO_PUBLIC_MOCK_MAP=1` usa um mapa ilustrativo em SVG, sem rede. No Android, uma build de produção precisa de uma chave Google Maps (`android.config.googleMaps.apiKey` no `app.json`); sem ela os marcadores aparecem sobre um fundo vazio — usa `EXPO_PUBLIC_MOCK_MAP=1` nesse caso.

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

- Os dados mockados vivem em memória (`MockDatabase`) e voltam ao início ao recarregar a app.
- O armazenamento seguro mock também é em memória: a sessão é retomada enquanto a app estiver aberta (ex.: voltar ao splash), não depois de a fechar. Para persistir de verdade no dispositivo, usar `EXPO_PUBLIC_SECURE_STORAGE=device`.
- A revisão visual foi feita no browser (Playwright, 390 × 844); as builds Android e iOS foram exportadas mas não testadas em dispositivo — ver [design-qa.md](design-qa.md).
