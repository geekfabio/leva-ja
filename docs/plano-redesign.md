# Plano de redesign — AngoLeva

Estado: implementação da base, fluxos e componentes realizada; validação visual em navegador/dispositivo pendente por restrições do ambiente. Ver [resultado da implementação](transport-redesign.md).

Actualização de âmbito — 11 de Outubro de 2026: o produto inclui cargas leves, cargas pesadas e mudanças de casa, além de assistência e reboque. A selecção de viaturas usa imagens 3D locais, sem emojis. Os detalhes da carga e as moradas acompanham o pedido até ao parceiro e à conclusão do serviço.

## Objectivo

Dar continuidade visual e funcional à experiência, desde a entrada até à conclusão de uma assistência, para clientes e parceiros. Usar a Bolt como referência principal para o verde, clareza das acções e simplicidade; Uber e Yango como referências de hierarquia, navegação e informação sobre o serviço. Preservar a identidade AngoLeva.

Prioridade: autenticação, pedido do cliente, execução pelo parceiro e pós-serviço. Administração e comércio recebem os padrões comuns; o redesign completo dessas áreas fica numa etapa posterior.

## 1. Consolidar a base existente

Antes de alterar mais telas, mapear cada rota, a sua acção principal, componentes utilizados e estados de carregamento, vazio, erro e sucesso. Capturar o estado actual quando houver um navegador ou dispositivo disponível.

Consolidar `palette.json`, `tokens.ts` e Tailwind: cores semânticas, tipografia, espaçamentos, cantos, contornos e estados de interacção. Verificar especialmente contraste e superfícies no modo escuro.

| Reutilizar | Evolução prevista |
| --- | --- |
| `AppButton` | Consolidar acções principais, secundárias e destrutivas; manter carregamento e bloqueio de envios repetidos. |
| `AppInput` | Completar rótulos acessíveis e mensagens de erro; separar apresentação do campo da validação de cada formulário. |
| `AppCard` | Consolidar superfícies e espaçamento; adicionar variantes apenas quando existirem usos reais repetidos. |
| `SelectionCard` | Reutilizar em serviço, viatura e pagamento, com selecção visível e acessível. |
| `StatusBadge` / `ProviderStatusPill` | Manter uma única correspondência entre estado, texto e cor. |
| `ScreenHeader`, `BottomAction`, `AuthScaffold` | Alinhar títulos, áreas seguras, teclado e posição das acções. |
| `OrderCard`, `ProviderMetric`, `ProofRow` | Consolidar padrões específicos de pedidos, ganhos e documentos. |
| `BrandMark`, `ProgressDots`, `ProviderNav` | Preservar identidade, progresso e orientação na navegação. |

Entrega: catálogo local de componentes com exemplos dos seus estados, separado das telas do produto.

## 2. Criar padrões de composição

Extrair componentes a partir de repetições concretas. Cada componente novo deve ter pelo menos dois usos identificados ou resolver uma responsabilidade transversal clara.

| Componente proposto | Responsabilidade | Primeiros usos |
| --- | --- | --- |
| `ScreenLayout` | Área segura, largura, rolagem e espaço reservado para acções. | Pedidos, perfil e telas do parceiro. |
| `IconButton` | Acção compacta com rótulo acessível, foco e área de toque consistente. | Voltar, notificações e suporte. |
| `ListRow` | Ícone, título, descrição e acção opcional. | Perfil, conta, suporte e histórico. |
| `StateMessage` | Estado vazio, erro ou sucesso com mensagem e próxima acção. | Pedidos, pesquisa, documentos e pagamento. |
| `ServiceSummary` | Serviço, viatura, origem e destino apresentados a partir dos mesmos dados. | Estimativa, confirmação e detalhe do parceiro. |
| `PriceSummary` | Valor, discriminação e indicação de estimativa ou total. | Estimativa, proposta e recibo. |
| `ServiceTimeline` | Etapas concluídas, actual e seguintes. | Acompanhamento do cliente e execução pelo parceiro. |
| `ContactActions` | Acções de mensagem, chamada e suporte. | Detalhe do cliente e detalhe do parceiro. |

Manter `AuthScaffold` especializado em autenticação. A estrutura comum não deve substituir layouts que tenham necessidades diferentes.

Os componentes de apresentação recebem dados e callbacks. Navegação, validação e transições do pedido ficam nas telas ou hooks do fluxo. Evitar componentes com muitas opções condicionais para representar telas inteiras.

Entrega: três telas representativas montadas com a base consolidada — login, estimativa do cliente e detalhe do pedido do parceiro. Verificar estas telas visualmente antes de expandir o padrão.

## 3. Redesenhar entrada e autenticação

Rotas: `welcome`, `(auth)/*`, `provider/login` e `provider/onboarding`.

- Clarificar os caminhos de cliente e parceiro na entrada.
- Uniformizar telefone, código, localização e morada com `AuthScaffold`, `AppInput` e `AppButton`.
- Mostrar erros junto dos campos e manter os dados ao voltar.
- Tornar explícita a próxima acção do parceiro: completar documentos, aguardar análise ou entrar.
- Apresentar a natureza simulada do acesso sem ocupar o lugar da tarefa principal.

Critério de conclusão: os dois percursos de entrada são navegáveis, com teclado aberto, erro de preenchimento e retorno à etapa anterior.

## 4. Redesenhar a jornada do cliente

Ordem de execução:

1. **Início e histórico:** `(tabs)/index`, `(tabs)/orders`, notificações. Destacar pedido activo, serviços e acesso ao suporte; prever ausência de pedidos.
2. **Criar pedido:** `request/service`, `incident`, `vehicle`, `location`, `destination`, `evidence`. Manter contexto, selecções, notas e anexos ao avançar e voltar; indicar o que é opcional.
3. **Rever e confirmar:** `request/estimate`, `payment`, `payment-result`, `matching`. Usar resumo comum, permitir corrigir escolhas e distinguir procura, confirmação e falha.
4. **Acompanhar:** `order/[id]`, `confirmed`, `chat`, `call`, `sos`, `cancel`. Priorizar estado actual, próxima etapa e contacto; diferenciar cancelamento e emergência das acções normais.
5. **Concluir:** `receipt`, `rate`, `complaint`, `complaint-status`, perfil, conta e suporte. Apresentar resultado, recibo e próximos passos com o mesmo padrão.

Critério de conclusão: o resumo e o pedido confirmado mostram as escolhas do cliente. Nenhuma etapa regressa silenciosamente a dados fixos diferentes. O fluxo inclui voltar, cancelar, erro e conclusão, além do percurso de sucesso.

## 5. Redesenhar a jornada do parceiro

Rotas: `provider/index`, `requests`, `request/[id]`, `quote/[id]`, `navigation/[id]`, `proof/[id]`, `earnings`, `history`, `profile`, `support` e `onboarding`.

- **Painel:** disponibilidade, serviço actual e ganhos com prioridades claras. Preservar a disponibilidade ao navegar entre as áreas.
- **Pedidos:** cartões com serviço, distância, viatura e valor; estados vazios e detalhes antes de aceitar.
- **Execução:** uma acção principal correspondente ao estado — aceitar, deslocar, chegar, iniciar ou concluir. Usar `ServiceTimeline` e `ContactActions`.
- **Propostas e comprovativos:** campos validados, explicação do ajuste e estados de envio, análise e aprovação.
- **Ganhos e histórico:** reutilizar cartões de métricas e linhas de lista, com valores e estados consistentes com os serviços.
- **Perfil e suporte:** organizar documentos, viatura, áreas de actuação e ajuda em secções previsíveis.

Critério de conclusão: as transições feitas pelo parceiro aparecem de forma coerente no acompanhamento do cliente dentro da demonstração local.

## 6. Fechar consistência e validar

- Revisar as telas secundárias para retirar estilos duplicados e acções sem destino.
- Verificar navegação de retorno, toque, foco, leitores de ecrã e aumento de texto.
- Capturar telas de referência em larguras de 320, 390 e 768 px e na versão web larga; testar também teclado aberto e modo escuro.
- Comparar login, início, selecção, estimativa, acompanhamento e painel do parceiro com os padrões definidos.
- Acrescentar testes de comportamento para regressões reais: dados preservados até à confirmação, alteração de estado entre cliente e parceiro e disponibilidade ao navegar.
- Executar TypeScript, testes relevantes e exportações web/Android/iOS; complementar com execução em dispositivo ou emulador.

Actualmente, a captura visual está bloqueada pelas restrições do ambiente. Resolver o acesso a um navegador ou dispositivo é uma dependência para concluir a validação visual; a compilação não a substitui.

## Sequência de entregas

| Entrega | Conteúdo | Depende de |
| --- | --- | --- |
| A | Inventário, tokens e catálogo de componentes. | Base existente. |
| B | Padrões de composição e três telas representativas. | A. |
| C | Entrada de cliente e parceiro. | B. |
| D | Pedido, acompanhamento e pós-serviço do cliente. | B e C. |
| E | Operação, ganhos e perfil do parceiro. | B e estados definidos em D. |
| F | Revisão transversal e validação visual/funcional. | C, D e E. |

Cada entrega deve incluir telas navegáveis, estados relevantes, componentes reutilizados e evidências de validação. O resultado final deve permitir alterar um padrão partilhado num único lugar sem corrigir cada tela separadamente.

Integrações reais de SMS, GPS, pagamentos e backend permanecem trabalho separado. A demonstração deve manter consistência entre os seus dados e acções durante todo o redesign.
