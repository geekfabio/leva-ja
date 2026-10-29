# Redesign de transportes — 11 de Outubro de 2026

## Produto

O AngoLeva passa a apresentar três famílias de transporte — cargas leves, cargas pesadas e mudanças — além de reboque e apoio automóvel. A direcção visual mantém verde vivo, tipografia clara e componentes partilhados.

## Imagens 3D

`assets/vehicles/fleet-3d.png` contém seis renders 3D com transparência, gerados para esta implementação. A imagem mede 1536 × 1024 px e organiza-se em três colunas e duas linhas:

| Célula | Categoria |
| --- | --- |
| 0 | Reboque plataforma |
| 1 | Pickup tipo Hilux |
| 2 | Carrinha fechada |
| 3 | Camião de mudanças |
| 4 | Camião de carga pesada |
| 5 | Viatura de apoio |

`VehicleArt` apresenta a célula correspondente através de recorte de layout, mantendo um único ficheiro local. `VehicleCard` adiciona selecção e texto acessível. São imagens renderizadas em 3D, não modelos interactivos ou emojis. As imagens representam categorias; a capacidade e o modelo exacto precisam de confirmação pelo parceiro.

## Componentes e dados partilhados

- `ScreenLayout`, `ScreenHeader` e `BottomAction`: rolagem, teclado, área segura, títulos e acção principal.
- `AppButton`, `AppInput`, `AppCard`, `IconButton`, `ListRow`, `SelectionCard` e `StateMessage`: padrões de interacção e apresentação.
- `ServiceSummary`, `PriceSummary`, `ServiceTimeline` e `ContactActions`: composição partilhada pelos percursos de cliente e parceiro.
- `src/domain/catalog.ts`: serviços, compatibilidade das categorias de viatura, imagens e preços de demonstração.
- `useRequestDraft`: detalhes do pedido antes da confirmação.
- `useOrderStore`: pedido confirmado, disponibilidade do parceiro, transições do serviço, proposta, pagamento, comprovativos, mensagens, avaliação e ocorrência locais.

O catálogo `/ui-kit` é visível apenas em desenvolvimento. Na exportação de produção redirecciona para o início.

## Percursos implementados

1. Entrada e autenticação apresentam transporte, mudanças e assistência.
2. Início permite escolher cargas leves, mudança, carga pesada ou reboque; apoio automóvel mantém acesso próprio.
3. Os detalhes de transporte exigem descrição, peso positivo e dimensões. Ajuda à carga e informação de acesso são opcionais.
4. A selecção mostra viaturas 3D compatíveis com o serviço.
5. Transportes exigem origem e destino; assistência no local não recebe um destino de carga antigo.
6. A estimativa e o pagamento reutilizam a mesma tabela de preços demonstrativos. A confirmação cria um pedido independente e bloqueia envios repetidos.
7. O parceiro vê os dados desse pedido e avança por aceitar, deslocar, chegar, iniciar e concluir. Offline impede novas aceitações; serviços já aceites continuam acessíveis.
8. O cliente acompanha as mesmas transições e pode aceitar uma proposta de ajuste. Concluir o serviço não confirma automaticamente o pagamento.
9. Histórico, ganhos, resumo, comprovativos e ocorrência usam o pedido seleccionado. Mensagens e avaliações são guardadas na sessão.

Os atalhos de transporte em `/demo` permitem carregar exemplos sem preencher manualmente os formulários.

## Validação

- TypeScript: aprovado.
- Exportação Expo para web, Android e iOS: aprovada em `/tmp/leva-ja-cargo-redesign`, incluindo o atlas 3D local. Não equivale a instalação e teste em dispositivo.
- 20 testes aprovados, cobrindo autenticação, selecção visual acessível, formulário de carga, confirmação sem duplicação, oito tipos de serviço, compatibilidade de viatura, preservação dos dados e transições do parceiro.
- Verificação de espaços no diff: aprovada.
- Captura visual: bloqueada. A tentativa de abrir um socket de preview em `127.0.0.1` devolveu `EPERM`; o ambiente anterior também bloqueou o Chromium. Não foi realizada comparação visual das telas nem teste em dispositivo.

## Limites

Tudo permanece numa demonstração local em memória. Não há SMS, despacho real, GPS, upload de documentos/fotos, chamada real, pagamento, recibo fiscal ou suporte externo. Os valores apresentados não são tarifas comerciais. Os estados de pagamento e os comprovativos são explicitamente simulados. Recarregar o runtime repõe os dados de demonstração.

## Demonstração local

Na tela de boas-vindas, “Experimentar demonstração” abre exemplos como cliente ou parceiro. Cargas leves, mudanças e cargas pesadas têm pedidos com imagens 3D, descrição, peso, dimensões, acessos e preços simulados. Os pedidos de carga também aparecem na lista inicial de pedidos disponíveis para parceiros.

Cada cenário repõe os pedidos em memória, limpa as alterações anteriores desse exemplo e coloca o parceiro online. Não há serviços, pagamentos ou mensagens reais. As imagens 3D são recursos locais, não modelos interactivos.

Validação adicional: três testes verificam a aceitação dos pedidos de carga, o preço e o reinício dos cenários sem duplicar pedidos ou conservar mensagens anteriores.
