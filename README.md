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

## Próxima fase

Integrar backend, localização/GPS, mapa, disponibilidade de prestadores, chat, notificações e pagamentos.
