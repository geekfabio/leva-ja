# Roadmap UI/UX — Leva Já

## Princípios

- Priorizar segurança e clareza sob pressão.
- Manter sempre uma acção principal visível.
- Mostrar preço e prazo antes de confirmar o pedido.
- Usar texto directo, contraste alto e áreas de toque generosas.
- Não simular funcionalidades reais: toda a fase usa dados mockados identificáveis.

## Telas do cliente

| Etapa | Tela | Decisão principal |
| --- | --- | --- |
| Entrada | Boas-vindas e onboarding | Conhecer serviço e activar conta |
| Pedido | Início | Pedir assistência ou consultar pedido activo |
| Pedido | Tipo de problema | Identificar o serviço certo |
| Pedido | Viatura | Preparar o prestador |
| Pedido | Localização | Definir recolha e destino opcional |
| Pedido | Estimativa | Conhecer valor e ETA antes de confirmar |
| Pedido | Procura | Saber que o pedido está a ser processado |
| Acompanhamento | Detalhe da assistência | Consultar condutor, estado e suporte |
| Pós-serviço | Avaliação | Registar qualidade do atendimento |
| Gestão | Histórico e perfil | Rever assistências, viaturas e preferências |

## Melhorias incluídas nesta iteração

- Conversão do antigo modelo de entregas para assistência automóvel.
- Hierarquia visual verde, preta e branca, com CTA consistente.
- Sequência linear em quatro passos antes da confirmação.
- Cartão de assistência activa sempre acessível no início.
- Estados de pedido legíveis: procura, a caminho e concluído.
- Suporte contextual com aviso de segurança.

## Cobertura actual e páginas em falta

| Área | Estado | Página/fluxo em falta |
| --- | --- | --- |
| Entrada | Parcial | Splash screen nativa configurada; falta validar em dispositivo e criar estados de sessão persistente. |
| Autenticação | Parcial | Telefone e OTP mockados existem; faltam reenvio de código, erro/bloqueio e sessão real. |
| Pedido | Parcial | Falta seleccionar destino no mapa, notas/fotos do incidente e confirmação de pagamento. |
| Acompanhamento | Parcial | Falta mapa GPS real, chat com o condutor, ligação activa e notificações push. |
| Gestão | Parcial | Faltam CRUD real de viaturas, moradas e métodos de pagamento. |
| Pós-serviço | Parcial | Falta recibo/factura, detalhe de preço final, cancelamento com motivo e resolução de reclamações. |
| Segurança | Em falta | Falta botão SOS, contactos de emergência e consentimento explícito de localização. |
| Prestador | Em falta | Falta aplicação/portal do condutor: disponibilidade, aceitar serviço, navegação e ganhos. |
| Administração | Em falta | Falta painel web para pedidos, prestadores, zonas, preços, suporte e métricas. |

### Rotas legadas a remover ou substituir

As rotas de e-commerce ainda presentes no repositório (`cart`, `checkout`, `category`, `merchant`, `product`, `search` e componentes/mocks `commerce`) não fazem parte do Leva Já. Não estão expostas no fluxo novo e devem ser removidas na próxima limpeza técnica.

## Activos de marca

| Activo | Uso |
| --- | --- |
| `assets/brand/leva-ja-mark.png` | Símbolo principal e marca na app |
| `assets/icons/app-icon.png` | Ícone para lojas e dispositivos |
| `assets/icons/adaptive-icon.png` | Ícone Android adaptativo |
| `assets/icons/favicon.png` | Favicon web |

Paleta aprovada: verde `#16A34A`, quase-preto `#102018` e branco `#FFFFFF`.

## Próxima iteração UI/UX

1. Substituir o mapa mockado por mapa real e permissões explícitas.
2. Criar estados vazios, erros e indisponibilidade por zona.
3. Testar tamanhos de letra, contraste e leitor de ecrã.
4. Testar o fluxo com condutores e clientes em Luanda.
