# ETAPA 02: PROTÓTIPO ESTRUTURAL COM HTML SEMÂNTICO

Esta etapa transforma a proposta definida em [`docs/proposta.md`](proposta.md) em uma primeira interface web do MadeiraFlow, usando HTML semântico. Ainda não há lógica de aplicação, banco de dados, API, autenticação ou JavaScript: o objetivo é representar a estrutura e o domínio do sistema.

## Funcionalidades implementadas

Nesta etapa as funcionalidades estão representadas apenas na interface, sem lógica funcional por trás (os formulários não enviam dados de verdade e as listagens usam conteúdo de exemplo):

* Visualização de um painel com o resumo de projetos e a listagem dos projetos mais recentes;
* Busca de projetos por cliente e por status (campo e formulário presentes);
* Cadastro de cliente, com formulário para nome, telefone, e-mail, endereço e observações;
* Consulta de clientes já cadastrados;
* Cadastro de projeto, com formulário para vincular um cliente, descrever o móvel, o ambiente de destino e o status inicial;
* Visualização dos detalhes de um projeto, incluindo os materiais associados, o orçamento (materiais, mão de obra e total) e a linha do tempo de andamento.

## Páginas criadas

Todas as páginas ficam em `src/` e compartilham o mesmo cabeçalho, navegação, rodapé e folha de estilos (`src/css/style.css`).

| Página | Arquivo | Corresponde à tela da proposta |
|---|---|---|
| Painel de projetos | `src/index.html` | Painel de Projetos |
| Clientes | `src/cliente.html` | Cadastro e detalhes do cliente |
| Novo projeto | `src/novo-projeto.html` | (formulário de cadastro de projeto) |
| Detalhes do projeto: armário planejado (Renata Almeida) | `src/projeto-armario-sala.html` | Detalhes do projeto / Orçamento |
| Detalhes do projeto: cozinha planejada (João Pedro Santos) | `src/projeto-cozinha.html` | Detalhes do projeto / Orçamento |
| Detalhes do projeto: guarda-roupa (Marcos Vinícius Lima) | `src/projeto-guarda-roupa.html` | Detalhes do projeto / Orçamento |
| Detalhes do projeto: escrivaninha (Renata Almeida) | `src/projeto-escrivaninha.html` | Detalhes do projeto / Orçamento |

Cada projeto listado no painel tem sua própria página de detalhes, acessada pelo link "Ver detalhes" do respectivo card. Isso substitui uma única página fixa de detalhes por uma página por projeto, já que cada um tem cliente, materiais e orçamento diferentes.

## Decisões relacionadas à estrutura HTML

* Cada página usa `header` com `nav` para a navegação principal, `main` para o conteúdo central e `footer` para o rodapé, mantendo a mesma estrutura em todas as telas.
* Dentro do `main`, o conteúdo é dividido em `section`, cada uma com um `h2` associado por `aria-labelledby`, agrupando partes distintas da tela (por exemplo: resumo, filtros, listagem, formulário).
* Cada projeto ou cliente listado é representado como um `article`, por se tratar de um item de conteúdo independente que poderia ser reaproveitado fora do contexto da página.
* Os formulários usam `form`, `fieldset` e `legend` para agrupar campos relacionados (por exemplo, "Identificação" e "Endereço" no cadastro de cliente), e todo campo tem um `label` associado via atributo `for`/`id`, conforme exigido nos critérios da etapa.
* A tabela de materiais e a tabela de orçamento usam `table`, `caption`, `thead`/`tbody`/`tfoot` e `th` com `scope="col"`, por se tratar de dados tabulares reais (itens, quantidades e valores).
* O andamento do projeto é representado como uma lista ordenada (`ol`) com `time` em cada item, já que reflete uma sequência cronológica de eventos.
* O status de cada projeto é exibido como uma etiqueta visual (inspirada nas etiquetas físicas usadas em peças de madeira na marcenaria), reforçando visualmente o domínio do sistema.

## Estrutura de arquivos desta etapa

```text
src/
├── index.html
├── cliente.html
├── novo-projeto.html
├── projeto-armario-sala.html
├── projeto-cozinha.html
├── projeto-guarda-roupa.html
├── projeto-escrivaninha.html
└── css/
    └── style.css
```
