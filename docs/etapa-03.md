# ETAPA 03: INTERFACE RESPONSIVA COM CSS

Esta etapa evolui o protótipo estrutural da [Etapa 02](etapa-02.md) para uma interface responsiva, sem alterar o conteúdo, os textos ou a estrutura funcional definidos anteriormente. Todas as páginas continuam usando o mesmo arquivo `src/css/style.css`.

## 1. Interfaces apresentadas

As mesmas telas da Etapa 02 foram testadas e ajustadas nos três tamanhos de tela exigidos. Para as evidências (seção 6), foram escolhidas três interfaces representativas:

1. **Painel de projetos** (`src/index.html`): cabeçalho, resumo em números e listagem de cards.
2. **Clientes** (`src/cliente.html`): formulário de cadastro e listagem de clientes.
3. **Novo projeto** (`src/novo-projeto.html`): formulário de cadastro de projeto, com campos agrupados em `fieldset`.

As demais páginas (`projeto-armario-sala.html`, `projeto-cozinha.html`, `projeto-guarda-roupa.html`, `projeto-escrivaninha.html`) usam os mesmos componentes (cabeçalho, `.sheet`, tabelas, timeline) e por isso herdam a mesma responsividade, sem necessidade de captura separada.

## 2. Viewports utilizados

| Dispositivo | Viewport |
|---|---|
| Desktop | 1440 × 900 px |
| Tablet | 768 × 1024 px |
| Smartphone | 390 × 844 px |

## 3. Breakpoints utilizados

O CSS usa três faixas, organizadas no final de `src/css/style.css`:

* `min-width: 1201px`: aproveita melhor o espaço em desktops largos (referência: 1440px), ampliando a largura do conteúdo e passando os cards do painel para múltiplas colunas.
* `max-width: 1024px` (tablet, referência: 768px): ajusta espaçamentos do cabeçalho e do conteúdo, e organiza o resumo do painel em 2 colunas.
* `max-width: 600px` (smartphone, referência: 390px): reorganiza o cabeçalho em coluna, empilha o resumo do painel, os cards e os botões de ação, e ajusta o tamanho dos títulos.

## 4. Principais decisões de responsividade

* **Flexbox** já era usado em `.site-header__inner`, `.main-nav ul`, `.card__top`, `.card__footer` e `.actions`; essas estruturas foram mantidas e ganharam ajustes de `flex-direction` e `flex-wrap` nos breakpoints para reorganizar cabeçalho, cards e botões no smartphone.
* **CSS Grid** já era usado em `.summary`, `.card` (layout interno), `form`, `fieldset` e `.timeline`; o grid de `.summary` (resumo do painel) passou a ter um número de colunas definido explicitamente por breakpoint (múltiplas colunas no desktop largo, 2 no tablet, 1 no smartphone), e `.card-list` passou a usar Grid com múltiplas colunas em desktops largos.
* **Media queries** foram reorganizadas em um único bloco no final do arquivo CSS, com comentários indicando a que faixa de tela cada uma se refere.
* **Espaçamentos consistentes**: foi criada uma escala de variáveis (`--space-2xs` a `--space-2xl`) e ela passou a ser usada nos principais componentes (cabeçalho, `main`, `.sheet`, botões de ação), no lugar de valores soltos repetidos.
* **Tabelas responsivas**: cada tabela foi envolvida por um container `.table-scroll`, que permite rolagem horizontal controlada apenas da tabela quando ela não cabe na tela, sem afetar o restante da página. A tabela de materiais (4 colunas) recebeu uma largura mínima (`.table--materials`) para continuar legível em vez de espremer o texto.
* **Formulários**: o único estilo inline do projeto (`style="max-width: 320px;"`, usado nos campos de busca do painel) foi substituído pela classe `.field--narrow`, que volta a ocupar 100% da largura no smartphone.
* **Menu**: no smartphone, os links de navegação passam a ocupar a largura toda do cabeçalho, com um preenchimento (`padding`) maior para facilitar o toque.
* **Acessibilidade preservada**: nenhum `label`, `aria-label`, `aria-labelledby` ou `aria-current` foi removido; a estrutura semântica definida na Etapa 02 (`header`, `nav`, `main`, `section`, `article`, `footer`, `form`) permanece a mesma.

## 5. Localização dos arquivos CSS responsáveis

Toda a responsividade está em um único arquivo, compartilhado por todas as páginas:

```text
src/css/style.css
```

As regras de responsividade específicas ficam agrupadas no bloco final do arquivo, a partir do comentário `/* Responsividade */`, dividido em três `@media`: desktop largo (`min-width: 1201px`), tablet (`max-width: 1024px`) e smartphone (`max-width: 600px`).

## 6. Evidências

A estrutura de pastas para as capturas de tela já está preparada em [`docs/evidencias/etapa-03/`](evidencias/etapa-03/), com um arquivo `README.md` explicando exatamente quais 9 imagens precisam ser adicionadas manualmente:

```text
docs/evidencias/etapa-03/
├── desktop-tela-01.png     (Painel de projetos, 1440 x 900)
├── desktop-tela-02.png     (Clientes, 1440 x 900)
├── desktop-tela-03.png     (Novo projeto, 1440 x 900)
├── tablet-tela-01.png      (Painel de projetos, 768 x 1024)
├── tablet-tela-02.png      (Clientes, 768 x 1024)
├── tablet-tela-03.png      (Novo projeto, 768 x 1024)
├── smartphone-tela-01.png  (Painel de projetos, 390 x 844)
├── smartphone-tela-02.png  (Clientes, 390 x 844)
└── smartphone-tela-03.png  (Novo projeto, 390 x 844)
```

As 9 capturas já foram anexadas nesta pasta, seguindo exatamente os nomes acima. Elas foram feitas manualmente pelo aluno, usando o modo responsivo do navegador, sobre as três páginas listadas na seção 1.
