# AngoLeva — sistema visual

Direcção: interfaces simples de mobilidade, com o verde como elemento principal, inspirado na Bolt. Mantém a marca AngoLeva e os fluxos locais de demonstração.

## Paleta e hierarquia

Fonte partilhada: `src/theme/palette.json`, consumida pelos tokens e pelo Tailwind.

| Uso | Cor |
| --- | --- |
| Acção principal, destaques | `#34D186` |
| Texto e ícones verdes | `#087F4F` |
| Superfície verde suave | `#E5F8EE` |
| Texto principal | `#132A21` |
| Texto secundário | `#64746C` |
| Fundo | `#F5F7F6` |
| Contornos | `#DFE7E2` |

O verde vivo usa texto escuro. O verde escuro permite texto branco nas acções compactas existentes. Erros e cancelamentos usam vermelho; estados pendentes usam âmbar. Os estados incluem sempre texto.

## Componentes

- `AppButton`: altura mínima de 56, cantos de 16, variantes principal, secundária (`ghost`) e destrutiva; estados de foco, pressão, desactivado e carregamento.
- `AppInput`: altura mínima de 56, texto de 16, foco, erro, ajuda, campo multilinha e suporte a leitores de ecrã. Todos os campos nativos do projecto passam por este componente.
- `AppCard`: contorno discreto, cantos de 24 e espaçamento interno de 20.
- `SelectionCard`: selecção única com indicador marcado e semântica de rádio.
- `StatusBadge`: cores semânticas partilhadas entre pedidos e parceiros.
- `ScreenHeader`: acção de voltar de 48, título e progresso do pedido.
- `BottomAction`: acção fixa com margem para a área segura do dispositivo.
- `AuthScaffold`: conteúdo rolável, adaptação ao teclado e largura de leitura limitada.

## Fluxos

- Entrada: caminhos separados para cliente e parceiro, validação de telefone e mensagens de erro no código de confirmação.
- Cliente: serviços em duas colunas com Flexbox, notificações ligadas à sua rota e destaque para assistência activa.
- Pedido: seis passos consistentes (serviço, incidente, viatura, localização, estimativa, pagamento); escolhas de serviço, viatura e destino mantidas num rascunho local durante a navegação.
- Parceiro: ganhos em destaque, disponibilidade com interruptor acessível e navegação persistente nas quatro áreas principais; acesso a documentos, histórico e suporte pelo perfil.
- Web: área mobile limitada a 680 px; administração mantém a largura disponível.

## Verificação e limites

Testes de interacção em `src/components/ui/__tests__/flows.test.tsx`: telefone inválido, papel do parceiro, código incorrecto/correcto, selecção preservada, pesquisa de destino e bloqueio de botão em carregamento.

Os valores, pagamentos, GPS, documentos e atribuição de prestadores continuam simulados. O rascunho é local à sessão e não constitui persistência de conta ou integração com backend.

A captura visual e a execução em dispositivo continuam pendentes: o Chromium não iniciou neste ambiente por restrições de sockets. Compilação e testes de componentes não substituem essa revisão visual.
