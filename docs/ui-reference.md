# Leva Já — referências visuais mobile

Este guia reúne as referências UI/UX produzidas para as aplicações mobile da Leva Já. As imagens são materiais de direcção visual: orientam a implementação com dados mockados; não representam integrações reais de GPS, pagamentos, chamadas ou suporte.

## Regras visuais comuns

- Verde Leva Já para acções e estados activos; superfícies claras e tipografia de contraste elevado.
- Acção principal sempre fixa no fundo quando a decisão seguinte for inequívoca.
- Mapa e acompanhamento aparecem apenas quando ajudam o utilizador a tomar uma decisão ou a acompanhar a execução.
- O cliente vê o estado do pedido; o prestador vê também a viatura, o ganho e a próxima acção operacional.

## 1. Entrada e conta

| # | Ecrã | Finalidade |
| --- | --- | --- |
| 01 | Splash | Apresentar a marca enquanto a sessão inicia. |
| 02–04 | Onboarding | Explicar assistência, acompanhamento e segurança. |
| 05 | Escolha de perfil | Separar cliente e prestador desde a entrada. |
| 06–10 | Acesso | Login, criação de conta, recuperação, validação e localização. |

<img src="assets/ui-reference/01-splash.jpg" width="220" alt="Splash Leva Já"> <img src="assets/ui-reference/02-onboarding-assistance.jpg" width="220" alt="Onboarding de assistência"> <img src="assets/ui-reference/03-onboarding-live-tracking.jpg" width="220" alt="Onboarding de acompanhamento"> <img src="assets/ui-reference/04-onboarding-safety.jpg" width="220" alt="Onboarding de segurança">

<img src="assets/ui-reference/05-profile-selection.jpg" width="220" alt="Selecção de perfil"> <img src="assets/ui-reference/06-login.jpg" width="220" alt="Login"> <img src="assets/ui-reference/07-registration.jpg" width="220" alt="Criação de conta"> <img src="assets/ui-reference/08-password-recovery.jpg" width="220" alt="Recuperar acesso">

<img src="assets/ui-reference/09-email-verification.jpg" width="220" alt="Confirmação de email"> <img src="assets/ui-reference/10-location-permission.jpg" width="220" alt="Permissão de localização">

## 2. Pedido do cliente

Esta etapa suporta reboque, carga com pickup, mudança pequena e mudança de casa. O formulário deve mostrar apenas os campos relevantes para o serviço escolhido.

| # | Ecrã | Finalidade |
| --- | --- | --- |
| 11–12 | Início e serviço | Descobrir e seleccionar a necessidade. |
| 13–14 | Reboque | Identificar o incidente e a viatura. |
| 15–18 | Carga e mudanças | Definir volume, ajudantes, acessos, agenda e fotos. |
| 19–20 | Trajecto e estimativa | Confirmar recolha, destino, viatura e valor previsto. |

<img src="assets/ui-reference/11-client-home.jpg" width="220" alt="Início do cliente"> <img src="assets/ui-reference/12-service-category.jpg" width="220" alt="Categorias de serviço"> <img src="assets/ui-reference/13-incident-type.jpg" width="220" alt="Tipo de incidente"> <img src="assets/ui-reference/14-vehicle-details.jpg" width="220" alt="Dados da viatura">

<img src="assets/ui-reference/15-cargo-details.jpg" width="220" alt="Detalhes de carga"> <img src="assets/ui-reference/16-moving-details.jpg" width="220" alt="Detalhes da mudança"> <img src="assets/ui-reference/17-moving-schedule.jpg" width="220" alt="Agendamento da mudança"> <img src="assets/ui-reference/18-cargo-photos.jpg" width="220" alt="Fotos da carga">

<img src="assets/ui-reference/19-route.jpg" width="220" alt="Trajecto do serviço"> <img src="assets/ui-reference/20-estimate.jpg" width="220" alt="Estimativa de preço">

## 3. Acompanhamento e conclusão

| # | Ecrã | Finalidade |
| --- | --- | --- |
| 21–23 | Atribuição e mapa | Procurar prestador, apresentar o escolhido e acompanhar a chegada. |
| 24–25 | Comunicação | Chat e chamada contextualizados ao pedido activo. |
| 26–28 | Execução | Validar chegada, recolha e transporte. |
| 29–30 | Pagamento | Escolher pagamento, consultar recibo e avaliar. |

<img src="assets/ui-reference/21-matching.jpg" width="220" alt="Procura de prestador"> <img src="assets/ui-reference/22-provider-found.jpg" width="220" alt="Prestador encontrado"> <img src="assets/ui-reference/23-live-tracking.jpg" width="220" alt="Acompanhamento em tempo real"> <img src="assets/ui-reference/24-chat.jpg" width="220" alt="Chat com prestador">

<img src="assets/ui-reference/25-call.jpg" width="220" alt="Chamada ao prestador"> <img src="assets/ui-reference/26-provider-arrival.jpg" width="220" alt="Chegada do prestador"> <img src="assets/ui-reference/27-pickup-confirmation.jpg" width="220" alt="Confirmação de recolha"> <img src="assets/ui-reference/28-in-transit.jpg" width="220" alt="Em transporte">

<img src="assets/ui-reference/29-payment.jpg" width="220" alt="Escolha de pagamento"> <img src="assets/ui-reference/30-receipt-rating.jpg" width="220" alt="Recibo e avaliação">

## 4. Perfil, definições e suporte do cliente

| # | Ecrã | Finalidade |
| --- | --- | --- |
| 31 | Perfil | Centralizar histórico, endereços, métodos de pagamento e definições. |
| 32 | Definições | Controlar notificações, privacidade, localização, acessibilidade e sessão. |
| 33 | Ajuda e suporte | Pesquisar ajuda, falar com suporte ou aceder ao SOS. |

<img src="assets/ui-reference/31-client-profile.jpg" width="220" alt="Perfil do cliente"> <img src="assets/ui-reference/32-settings.jpg" width="220" alt="Definições"> <img src="assets/ui-reference/33-help-support.jpg" width="220" alt="Ajuda e suporte">

## 5. Operação do prestador

O prestador possui uma app operacional própria. O seu estado de disponibilidade e transições de serviço devem sincronizar, no futuro, com o acompanhamento do cliente.

| # | Ecrã | Finalidade |
| --- | --- | --- |
| 34 | Painel | Alternar disponibilidade, ver ganhos e priorizar pedidos próximos. |
| 35 | Novo pedido | Avaliar distância, carga, ajudante e ganho antes de aceitar. |
| 36 | Serviço em curso | Navegar, contactar o cliente e confirmar a entrega. |

<img src="assets/ui-reference/34-provider-dashboard.jpg" width="220" alt="Painel do prestador"> <img src="assets/ui-reference/35-provider-new-request.jpg" width="220" alt="Novo pedido para prestador"> <img src="assets/ui-reference/36-provider-active-service.jpg" width="220" alt="Serviço em curso para prestador">

## 6. Gestão operacional do prestador

| # | Ecrã | Finalidade |
| --- | --- | --- |
| 37 | Pedidos | Consultar, filtrar e abrir pedidos próximos. |
| 38–39 | Ganhos e transacções | Acompanhar saldo, desempenho e levantamentos. |
| 40 | Histórico | Consultar serviços concluídos, avaliações e valor recebido. |
| 41–44 | Perfil operacional | Gerir perfil, viatura, documentos, zonas e serviços aceites. |
| 45 | Proposta | Ajustar e justificar o valor de um serviço complexo. |
| 46 | Comprovativo de entrega | Registar fotografias, assinatura e condição da entrega. |

<img src="assets/ui-reference/37-provider-requests.jpg" width="220" alt="Pedidos do prestador"> <img src="assets/ui-reference/38-provider-earnings.jpg" width="220" alt="Ganhos do prestador"> <img src="assets/ui-reference/39-provider-transactions.jpg" width="220" alt="Transacções do prestador"> <img src="assets/ui-reference/40-provider-history.jpg" width="220" alt="Histórico do prestador">

<img src="assets/ui-reference/41-provider-profile.jpg" width="220" alt="Perfil do prestador"> <img src="assets/ui-reference/42-provider-vehicle.jpg" width="220" alt="Viatura do prestador"> <img src="assets/ui-reference/43-provider-documents.jpg" width="220" alt="Documentos do prestador"> <img src="assets/ui-reference/44-provider-zones-services.jpg" width="220" alt="Zonas e serviços do prestador">

<img src="assets/ui-reference/45-provider-price-proposal.jpg" width="220" alt="Proposta de preço"> <img src="assets/ui-reference/46-provider-delivery-proof.jpg" width="220" alt="Comprovativo de entrega">

## Mapeamento para implementação

| Domínio | Componentes reutilizáveis |
| --- | --- |
| Pedido | `ScreenHeader`, `SelectionCard`, `AppInput`, `BottomAction`, `ServiceSummary`, `PriceSummary` |
| Acompanhamento | `ServiceTimeline`, `ContactActions`, `StatusBadge`, mapa e folhas inferiores |
| Conta | `ListRow`, `AppCard`, `IconButton`, `StateMessage` |
| Prestador | `ProviderNav`, `ProviderMetric`, `OrderCard`, `EarningsChart`, `VehicleCard`, `DocumentStatus`, `DeliveryProof`, `ServiceTimeline` |

Os nomes e valores apresentados nas imagens são mockados. Para a fase de backend, substituir mapas, fotografias, coordenadas, prestadores, preços e métodos de pagamento por dados validados pelo serviço.
