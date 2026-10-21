# Design QA

## Verificação de rotas — 21 de Outubro de 2026

- Verificação estática: todas as navegações do código (`go`, `swap`, `router.*`, `href`) apontam para rotas existentes.
- Rastreio das 130 rotas (nova app e protótipo anterior) na exportação web com Playwright: 0 erros de página, 0 erros e 0 avisos de consola, nenhuma rota "não encontrada" ou ecrã em branco.
- Corrigido: ciclo infinito em `/help/report` (selector Zustand a criar arrays novos) e o mesmo risco no chat; erro `reading 'top'` do Reanimated na web ao substituir um ecrã durante a entrada (ex.: `/register-security` sem dados); avisos de curvas de animação não suportadas na web; estimativa sem dados sem saída; grelha de fotos a quebrar; marcadores sobrepostos no painel do prestador; textos cortados nas métricas e no cabeçalho do prestador.
- Ecrãs em falta criados: notificações (`/alerts`, com contagem por ler nos sinos) e alterar palavra-passe (`/settings/password`).
- `npm test`: 58 testes, incluindo regressões destes erros.

## Animações — 21 de Outubro de 2026

- Primitivas de movimento (`Appear`, `ScalePressable`, `AnimatedAmount`, `useBump`) aplicadas ao kit e aos ecrãs; respeitam reduzir movimento (sistema e preferência da app).
- `npm run typecheck`, `npm run lint` e `npm test` (55 testes) passaram; exportação web revista no Chromium sem alterações de layout.
- As capturas estáticas não validam a fluidez: falta rever a cadência a 60 fps num dispositivo Android e iOS.

## Nova experiência a partir das 46 referências — 21 de Outubro de 2026

- 46 referências implementadas (rotas no README), com componentes partilhados em `src/components/kit.ts`.
- `npm run typecheck`: passou.
- `npm run lint`: sem erros (avisos só em ficheiros do protótipo anterior).
- `npm test`: 9 suites, 53 testes — máquina de estados, preços, esquemas Zod, formatação, ciclo de vida cliente/prestador, kit e fluxos de login e reboque.
- `npx expo export --platform web` e `--platform android --platform ios`: bundles gerados sem erros. Não é uma instalação em dispositivo.
- Revisão visual no Chromium (Playwright, 390 × 844) da exportação web: acesso, pedido de carga e de mudança de casa (com proposta), acompanhamento completo até à avaliação, conta, definições, ajuda, SOS, e área do prestador do painel ao comprovativo, ganhos, levantamento e transacções. Corrigidos durante a revisão: rótulos truncados, cabeçalhos verdes cortados, redireccionamento por ecrãs em segundo plano na pilha e acções de proposta fora do ecrã.
- Não verificado: aparência e gestos em Android/iOS reais (mapa nativo, folhas inferiores, assinatura, teclado). O mapa da web é a versão ilustrativa em SVG.

## Cargo and moving redesign — 11 October 2026

- Added light freight, heavy freight and home moving to the customer and partner flows, sharing request data through completion.
- Generated and integrated six local 3D vehicle illustrations; validated atlas dimensions and alpha channel.
- `npm run typecheck`: passed.
- `npm test -- --runInBand`: passed, 20 tests.
- `npx expo export --platform all --output-dir /tmp/leva-ja-cargo-redesign`: exported web, Android and iOS bundles, including the vehicle atlas.
- `git diff --check`: passed.
- Live visual verification remains blocked: the local preview socket probe returned `EPERM`. No browser screenshot or device verification is claimed.
- See [implementation and limitations](docs/transport-redesign.md). `/demo` contains transport examples; `/ui-kit` is the development-only component gallery.

## UI/UX refresh — 10 October 2026

- Shared green palette and components applied across the existing app; login, customer home, request selection and partner home/profile/navigation redesigned.
- `npm run typecheck`: passed.
- `npm test -- --runInBand`: passed, 5 interaction tests.
- `npx expo export --platform all --output-dir /tmp/leva-ja-validated`: passed for web, Android and iOS. These are JS/Hermes exports, not device installation tests.
- `git diff --check`: passed.
- Calculated contrast for primary button text: 7.68:1; green text on white: 5.05:1; secondary text on the light surface: 4.59:1.
- Visual verification remains blocked: Chromium failed to launch because the execution sandbox disallowed required socket operations. No screenshots or device review are claimed.
- Implementation guidance: [design system](docs/design-system.md).

The following section records the earlier administration design review.

## Reference

Selected Product Design concept: operations command center (desktop 1440×1024), generated on 9 October 2026.

## Automated verification

- `npm run typecheck`: passed
- `npx expo export --platform web`: passed

## Visual verification

Blocked: this session does not expose a browser surface for capturing and comparing the local Expo web build against the selected visual reference. The dashboard was implemented from the selected direction with desktop/tablet breakpoints, responsive wrapping, an operations chart, approval queue, and pricing controls.

## Final result

Blocked — requires browser-based visual comparison before design-fidelity sign-off.
