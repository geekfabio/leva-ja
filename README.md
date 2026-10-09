# Leva Já

Aplicação mobile de assistência automóvel e reboque em Luanda. Esta fase é inteiramente navegável com dados mockados, para validar o fluxo e a experiência antes da integração com backend.

## Fluxo actual

1. Início com pedido rápido de assistência
2. Selecção do problema: reboque, bateria, pneu, combustível ou outro
3. Escolha da viatura
4. Confirmação da localização e destino opcional
5. Estimativa de preço e tempo de chegada
6. Procura de prestador verificado
7. Acompanhamento do reboque, suporte e avaliação
8. Histórico de assistências e perfil
9. Área do prestador com operação e ganhos mockados
10. Painel administrativo com pesquisa, filtros, paginação e totalizadores mockados

## Stack

- Expo + React Native + TypeScript
- Expo Router
- NativeWind
- Zustand para estado mockado
- TanStack Query preparado para integração futura
- React Hook Form + Zod
- Moti e Reanimated

## Começar

```bash
npm install
npx expo start --web
```

## Limites desta fase

- Não há chamadas de API reais, pagamentos ou geolocalização real.
- Valores, viaturas, localização, condutores e estados são mocks.
- A navegação e as telas representam o fluxo do cliente para validação UI/UX.

## Acessos de demonstração

Todos os acessos são locais e não enviam SMS nem validam credenciais reais.

| Área | Rota | Dados mockados |
| --- | --- | --- |
| Cliente | `/(auth)/phone` | `+244 912 345 678` · OTP `123456` |
| Prestador | `/provider/login` | `+244 923 456 789` · OTP `123456` |
| Administração | `/admin/login` | `admin@levaja.ao` · OTP `123456` |

O painel administrativo inclui dados paginados e pesquisáveis de pedidos, clientes, prestadores, pagamentos e alertas SOS. Todas as acções são demonstrações locais.

## Seed para apresentação

Abre a rota `/demo` para carregar cenários de demonstração sem editar dados manualmente. Cada cenário repõe uma cópia local dos pedidos e define o pedido activo para o fluxo correspondente:

- Cliente com reboque a caminho;
- Prestador com pedido novo ou já no local;
- Falha de pagamento;
- Pedido em disputa para operações e segurança.

As mudanças de estado do prestador e do cliente usam a mesma store mockada, permitindo demonstrar o workflow ponta-a-ponta no mesmo runtime.

## Identidade visual

- Logótipo/símbolo: `assets/brand/leva-ja-mark.png`
- Logótipos wordmark: `assets/brand/leva-ja-wordmark-light.svg` e `assets/brand/leva-ja-wordmark-dark.svg`
- Ícone da aplicação: `assets/icons/app-icon.png`
- Ícone Android adaptativo: `assets/icons/adaptive-icon.png`
- Favicon web: `assets/icons/favicon.png`
- Paleta: verde `#16A34A`, quase-preto `#102018` e branco `#FFFFFF`

Os activos estão ligados em `app.json` para Android, iOS/web e splash screen.

## Próxima fase

Integrar backend, localização/GPS, mapa, disponibilidade de prestadores, chat, notificações e pagamentos.
