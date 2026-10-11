# Leva Já

Aplicação mobile de transporte de cargas leves e pesadas, mudanças de casa, reboque e assistência automóvel em Luanda. Esta fase usa dados locais de demonstração para validar os fluxos antes da integração com backend.

## Redesign de transporte e mudanças

- Selecção de categorias com imagens 3D locais: reboque plataforma, pickup tipo Hilux, carrinha fechada, camião de mudanças, camião de carga pesada e viatura de apoio.
- Fluxo com descrição da carga, peso, dimensões, ajuda à carga/descarga, acessos e moradas.
- O pedido confirmado conserva a viatura, os detalhes e o preço no acompanhamento do cliente e na execução do parceiro.
- O parceiro pode aceitar, deslocar-se, confirmar recolha, concluir entrega, registar comprovativos de exemplo e propor um preço para aceitação do cliente.
- `/demo` inclui atalhos para cargas leves, mudanças e cargas pesadas. `/ui-kit` mostra o catálogo de componentes apenas em desenvolvimento.

Detalhes e limites: [redesign de transportes](docs/transport-redesign.md).

## Fluxo actual

1. Entrada como cliente ou parceiro
2. Escolha de carga leve, mudança, carga pesada, reboque ou apoio automóvel
3. Detalhes da carga ou incidente, peso, dimensões e acessos
4. Escolha da categoria de viatura com imagens 3D
5. Confirmação da origem e do destino
6. Resumo, estimativa e forma de pagamento
7. Pedido disponível para aceitação pelo parceiro
8. Acompanhamento de recolha, transporte ou assistência e conclusão
9. Histórico, resumo do pagamento, avaliação e ocorrência
10. Área do parceiro com disponibilidade, execução, propostas e ganhos locais

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
- Paleta: verde vivo `#34D186`, verde escuro `#087F4F`, quase-preto `#132A21` e branco `#FFFFFF`

O [sistema visual](docs/design-system.md) documenta os componentes partilhados, estados de interacção e os fluxos de cliente e parceiro. As cores têm uma fonte comum em `src/theme/palette.json`.

Os activos estão ligados em `app.json` para Android, iOS/web e splash screen.

## Próxima fase

Integrar backend, localização/GPS, mapa, disponibilidade de prestadores, chat, notificações e pagamentos.
