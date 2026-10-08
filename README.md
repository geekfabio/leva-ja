# Leva Já

Aplicação mobile de pedidos e entregas, orientada ao mercado angolano. Esta primeira versão estabelece o MVP visual com dados mockados e uma arquitectura preparada para integração com backend.

## Stack

- Expo + React Native + TypeScript
- Expo Router para navegação
- NativeWind para estilos utilitários
- Zustand para estado de interface
- TanStack Query preparado para dados remotos
- React Hook Form + Zod para formulários
- Reanimated, Moti e Gesture Handler para animações
- Gorhom Bottom Sheet, FlashList e Expo Image
- MMKV e Secure Store preparados para persistência e sessão

## Estrutura

```text
src/
├── app/             # rotas Expo Router
├── components/      # UI reutilizável
├── mocks/           # dados da Fase 1
├── providers/       # providers globais
├── services/        # cliente HTTP
├── stores/          # Zustand
├── theme/           # tokens de tema
└── types/           # contratos partilhados
```

## Começar

```bash
npm install
npx expo start --dev-client
```

> Para testar apenas no Expo Go durante a fase visual, pode usar `npx expo start`. Recursos com módulos nativos, como MMKV, requerem Development Build.

## Estado do MVP

- [x] Navegação por separadores e detalhe de pedido
- [x] Design system inicial e suporte de tema preparado
- [x] Dados mockados e store Zustand
- [x] Animação de entrada e bottom sheet
- [ ] Autenticação e perfil real
- [ ] Catálogo, carrinho e checkout
- [ ] GPS, pagamentos, chat e notificações
- [ ] Backend Hono + PostgreSQL + Drizzle

## Backend planeado

Hono.js + TypeScript + Drizzle ORM + PostgreSQL. Redis, WebSockets e serviços de pagamento entram na Fase 2.
