# Guia de apresentação — MadeiraFlow

Material de estudo para apresentar o projeto ao professor: o pitch, a estrutura de arquivos, o que cada etapa entregou, e uma explicação linha a linha do que o código faz. A ideia é você conseguir responder "por que você fez assim?" para qualquer parte do projeto.

---

## 1. O pitch (30 segundos para "vender" o projeto)

> "Marcenarias pequenas hoje organizam pedidos em caderno, WhatsApp e planilha solta. Isso faz perder medida, perder prazo e gerar orçamento divergente do que foi combinado. O MadeiraFlow centraliza esse fluxo inteiro — do pedido do cliente até a entrega — em um sistema web único. Comecei pela especificação do problema, depois construí a interface, deixei ela responsiva para funcionar em qualquer tela, e por fim adicionei interatividade real: busca, validação e cadastro que já persiste os dados no navegador."

Pontos a reforçar se o professor perguntar "por que esse projeto":
- Tem um problema de negócio real por trás (não é CRUD por CRUD).
- O fluxo faz sentido: cliente → projeto → orçamento → produção → entrega.
- Cada etapa da disciplina virou uma camada real do sistema (não foi feito tudo de uma vez).

---

## 2. Estrutura de pastas — o que é cada coisa

```text
madeiraflow/
├── README.md                     → cartão de visitas do repositório
├── docs/
│   ├── proposta.md               → Etapa 01: especificação do problema
│   ├── etapa-02.md                → Etapa 02: documentação do protótipo HTML
│   ├── etapa-03.md                → Etapa 03: documentação da responsividade
│   ├── etapa-04.md                → Etapa 04: documentação do JavaScript
│   └── evidencias/                → capturas de tela comprovando cada etapa
└── src/                           → o sistema em si (é isso que roda no navegador)
    ├── index.html                 → Painel de projetos (tela inicial)
    ├── cliente.html                → Cadastro e lista de clientes
    ├── novo-projeto.html           → Formulário de novo projeto
    ├── projeto-*.html              → 4 páginas de detalhe (uma por projeto)
    ├── css/style.css               → todo o visual do sistema (1 arquivo só)
    └── js/script.js                → toda a interatividade (1 arquivo só)
```

**Por que `docs/` e `src/` separados?** `docs/` é a documentação do processo (o que o professor pediu em cada etapa); `src/` é o produto em si. Separar os dois deixa claro o que é "prova do processo" e o que é "o sistema que funciona".

**Por que um `style.css` e um `script.js` só, em vez de um por página?** Porque as 7 páginas compartilham a mesma identidade visual e os mesmos componentes (cards, formulários, tags de status). Um arquivo central evita repetir regra de CSS ou função de JS em cada página — se eu mudar uma cor, muda em todo o sistema de uma vez.

---

## 3. O que cada etapa entregou (linha do tempo do projeto)

| Etapa | Nome | O que foi feito | Onde ver |
|---|---|---|---|
| 01 | Proposta e especificação | Definição do problema, público-alvo, funcionalidades, entidades, telas, tecnologias e diagrama | `docs/proposta.md` |
| 02 | Protótipo estrutural | HTML semântico puro (sem estilo), 7 páginas representando o domínio | `docs/etapa-02.md` |
| 03 | Interface responsiva | CSS com Flexbox, Grid e media queries — funciona em desktop, tablet e celular | `docs/etapa-03.md` |
| 04 | Interatividade com JavaScript | Busca dinâmica, validação de formulários e persistência de dados com `localStorage` | `docs/etapa-04.md` |

Se o professor perguntar "o que mudou de uma etapa pra outra", a resposta curta é: **02 deu a estrutura, 03 deu a aparência adaptável, 04 deu o comportamento.** O HTML da etapa 02 quase não mudou — só ganhou uns `id`s a mais para o JavaScript conseguir "pegar" os elementos.

---

## 4. HTML (Etapa 02) — por que a estrutura é essa

Cada página usa:
- `<header>` com `<nav>`: cabeçalho e menu, repetidos em todas as páginas (mesmo HTML colado em cada arquivo — não tem "componente" reutilizável porque é HTML puro, sem framework).
- `<main>` com `<section>`s: cada bloco de conteúdo da página é uma seção, com `aria-labelledby` apontando pro `<h2>` dela (acessibilidade: leitor de tela sabe do que se trata cada bloco).
- `<article class="card">`: cada projeto ou cliente listado é um "artigo" — a ideia semântica é que cada card faz sentido sozinho, fora de contexto, como uma notícia.
- `<form>` com `<fieldset>`/`<legend>`: os formulários agrupam campos relacionados (ex.: "Identificação" e "Endereço" no cadastro de cliente).
- Todo campo tem `<label for="...">`: exigência de acessibilidade e também o gancho que o CSS/JS usam (`campo.closest(".field")`).

**Pergunta provável:** "por que não usou React/Vue?" — Resposta: a disciplina pediu HTML/CSS/JS puro em cada etapa, e para o tamanho do projeto (7 páginas estáticas) não havia necessidade real de um framework; a complexidade de dados fica isolada no `script.js`.

---

## 5. CSS (Etapa 03) — como o visual funciona

### Variáveis (design tokens)

No topo do `style.css` existe um bloco `:root` com todas as cores, fontes e espaçamentos como variáveis:

```css
:root {
  --navy-deep: #16283a;   /* fundo */
  --brass: #c98a4b;        /* cor de destaque (botões, links) */
  --sage: #7c9473;         /* verde usado em "aprovado" e sucesso */
  --clay: #b96b52;         /* vermelho-terracota usado em erro */
  --space-md: 16px;        /* espaçamento padrão */
  ...
}
```

**Por quê:** trocar a identidade visual inteira (ex.: mudar o tom de azul) significa mudar uma linha, não procurar a cor em 50 lugares. Isso também é o motivo de erro e sucesso terem cores consistentes com o resto do sistema — erro usa `--clay` (mesma família de cor do status "orçamento pendente"), sucesso usa `--sage` (mesma cor do status "aprovado").

### Flexbox — para alinhar em linha

Usado em: cabeçalho (`.site-header__inner`), menu (`.main-nav ul`), topo do card (`.card__top`, nome + etiqueta de status lado a lado) e nos botões de ação (`.actions`). Flexbox entra sempre que o problema é "alinhar coisas em fileira e distribuir o espaço entre elas".

### CSS Grid — para organizar em grade

Usado em: resumo do painel (`.summary`, os 4 números), lista de cards (`.card-list`) e dentro de cada card (`.card`, empilhando título → descrição → rodapé). Grid entra quando o problema é "várias colunas/linhas organizadas", não só uma fileira.

### Media queries — adaptação por tamanho de tela

Três faixas, no fim do arquivo:
- `min-width: 1201px` → desktops grandes: usa mais largura, cards em várias colunas.
- `max-width: 1024px` → tablet: resumo do painel vira 2 colunas.
- `max-width: 600px` → celular: cabeçalho empilha, resumo vira 1 coluna só, botões ficam largura total (fácil de tocar).

**Pergunta provável:** "por que esses breakpoints e não outros?" — Resposta: 1024px e 600px são os tamanhos mais comuns onde layouts de tablet e celular "quebram" visualmente; e o de 1201px foi um extra, para não desperdiçar espaço em monitores grandes.

---

## 6. JavaScript (Etapa 04) — a parte que o professor mais vai perguntar

### 6.1 Arquitetura geral

Tudo está em `src/js/script.js`, um arquivo só, incluído nas 3 páginas que têm interatividade (`index.html`, `cliente.html`, `novo-projeto.html`). A estrutura é:

```js
document.addEventListener("DOMContentLoaded", function () {
  initPainelDeProjetos();   // só roda se existir #lista-projetos na página
  initFormularioCliente();  // só roda se existir #form-cliente na página
  initFormularioProjeto();  // só roda se existir #form-projeto na página
});
```

**Por que as 3 funções rodam em toda página, mesmo quando não se aplicam?** Cada função começa checando se o elemento que ela precisa existe (`if (!formulario) return;`). Se não existir, a função simplesmente para, sem erro. Isso evita ter um arquivo `.js` diferente por página — um arquivo só cobre as 3.

### 6.2 A camada de dados: por que `localStorage`

O projeto não tem servidor nem banco de dados (é só front-end). Então, para um cliente cadastrado em `cliente.html` "existir" também em `novo-projeto.html`, os dados precisam ficar guardados em algum lugar que sobrevive à troca de página — e o `localStorage` do navegador faz exatamente isso: ele persiste por origem (mesmo domínio/arquivo), mesmo fechando e abrindo o navegador de novo.

Duas chaves guardam tudo:

```js
const CHAVES_STORAGE = {
  clientes: "madeiraflow:clientes",
  projetos: "madeiraflow:projetos",
};
```

Cada uma guarda um **array de objetos**, convertido para texto com `JSON.stringify` na hora de salvar e `JSON.parse` na hora de ler (o `localStorage` só guarda texto puro, nunca objetos/arrays diretamente — por isso esse vai-e-volta é obrigatório).

**O truque da "primeira execução":**

```js
function carregarClientes() {
  let clientes = lerDoStorage(CHAVES_STORAGE.clientes);
  if (!clientes) {
    clientes = obterClientesIniciais(); // os 3 clientes originais, escritos à mão
    salvarNoStorage(CHAVES_STORAGE.clientes, clientes);
  }
  return clientes;
}
```

Na primeira vez que a página abre, o `localStorage` está vazio (`null`), então o sistema usa uma lista de dados iniciais (os mesmos 3 clientes e 4 projetos que já existiam desde a Etapa 02) e já salva isso no `localStorage`. Da segunda vez em diante, ele já encontra dados salvos e usa eles — nunca mais volta a usar a lista inicial, então nada se perde e nada duplica.

**Cadastrar um novo cliente ou projeto, por dentro:**

```js
function adicionarCliente(cliente) {
  const clientes = carregarClientes(); // pega tudo que já existe
  clientes.unshift(cliente);            // coloca o novo no início do array
  salvarClientes(clientes);             // salva o array inteiro de volta
  return clientes;
}
```

`unshift` (em vez de `push`) é usado de propósito: assim o cadastro mais recente sempre aparece primeiro na lista, sem precisar ordenar nada depois.

Cada registro tem um `id` único, gerado assim:

```js
function gerarId(prefixo) {
  return prefixo + "-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}
```

`Date.now()` é o horário atual em milissegundos — praticamente impossível dois cliques gerarem o mesmo número, e o sufixo aleatório é uma segurança extra. Isso evita usar o nome da pessoa como identificador (dois clientes podem se chamar igual; dois ids nunca colidem).

### 6.3 Funcionalidade 1 — Busca no Painel (`index.html`)

Fluxo:
1. Ao carregar a página, `carregarProjetos()` busca os dados (do `localStorage` ou dos iniciais) e `renderizarProjetos()` desenha um `<article class="card">` para cada projeto, via `document.createElement` — isso é **manipulação do DOM**.
2. Cada card recebe atributos `data-*` com os dados "crus" do projeto (`card.dataset.cliente`, `.titulo`, `.status`) — isso que a busca vai comparar.
3. A cada tecla digitada no campo de busca (**evento `input`**) ou troca de status (**evento `change`**), a função `filtrarProjetos()` roda de novo:

```js
const resultados = cards.filter(function (card) {
  const correspondeAoTermo = termo === "" || clienteDoCard.includes(termo) || tituloDoCard.includes(termo);
  const correspondeAoStatus = status === "" || statusDoCard === status;
  return correspondeAoTermo && correspondeAoStatus;
});

cards.forEach(function (card) {
  card.hidden = resultados.indexOf(card) === -1;
});
```

Aqui aparecem dois **métodos de iteração** de array: `filter` (que seleciona só os cards que batem com a busca) e `forEach` (que passa por todos os cards escondendo quem não está nos resultados). `card.hidden = true/false` é a alteração dinâmica da interface — o navegador esconde/mostra o elemento sem precisar recarregar nada.

4. Se `resultados.length === 0`, uma mensagem "Não encontramos projetos para essa busca." é criada e inserida (**tratamento de situação inválida/vazia**); ela é removida assim que volta a haver resultado.

**Detalhe interessante para citar na apresentação:** o filtro combina **dois critérios ao mesmo tempo** (cliente **e** status) com um `&&` — então dá pra buscar "projetos da Renata que estão aprovados", por exemplo.

### 6.4 Funcionalidade 2 — Cadastro de cliente (`cliente.html`)

Ao enviar o formulário (**evento `submit`**), o primeiro passo é `evento.preventDefault()` — isso impede o comportamento padrão do navegador (recarregar a página), para o JavaScript assumir o controle.

```js
function validarFormulario() {
  let formularioValido = true;
  if (campoNome.value.trim() === "") {
    definirErroDeCampo(campoNome, "Informe o nome do cliente.");
    formularioValido = false;
  } else {
    definirErroDeCampo(campoNome, "");
  }
  // ... mesma lógica para telefone (com regex de formato) e e-mail (opcional)
  return formularioValido;
}
```

A validação do telefone usa uma **expressão regular** (regex): `/^\(\d{2}\)\s?\d{4,5}-\d{4}$/` — isso exige o formato `(11) 98765-4321`. Se não bater com esse padrão, mostra erro. O e-mail é parecido, mas só é validado **se o campo não estiver vazio** (o cadastro original não marcava e-mail como obrigatório).

Se tudo estiver certo:
```js
const novoCliente = { id: gerarId("cliente"), nome: ..., telefone: ..., email: ... };
const clientesAtualizados = adicionarCliente(novoCliente); // salva no localStorage
renderizarClientes(clientesAtualizados);                   // redesenha a lista inteira
```

A lista inteira é **redesenhada do zero** a cada mudança (`listaClientes.innerHTML = ""` e depois um `forEach` recriando cada card) — isso garante que a tela sempre reflete exatamente o que está salvo, sem risco de "esquecer" de atualizar algum card antigo.

### 6.5 Funcionalidade 3 — Cadastro de projeto (`novo-projeto.html`)

A parte mais "conectada" do sistema: o `<select>` de cliente não vem mais fixo no HTML — ele é **reconstruído via JavaScript** toda vez que a página carrega:

```js
function preencherSelectDeClientes() {
  const clientes = carregarClientes(); // pega todos: originais + cadastrados
  campoCliente.innerHTML = "";
  clientes.forEach(function (cliente) {
    const opcao = document.createElement("option");
    opcao.value = cliente.id;
    opcao.textContent = cliente.nome;
    campoCliente.appendChild(opcao);
  });
}
```

Isso é o que resolve o problema de "cadastrei um cliente mas ele não aparece pra escolher no projeto" — porque agora o `<select>` sempre lê do mesmo lugar (`localStorage`) que o cadastro de cliente escreve.

Ao enviar o formulário com sucesso, o código usa **`find`** (outro método de iteração) para localizar o objeto completo do cliente escolhido:

```js
const clienteSelecionado = clientes.find(function (cliente) {
  return cliente.id === campoCliente.value;
});
```

`find` retorna o **primeiro** item do array que bate com a condição (diferente de `filter`, que retorna **todos** que batem). Faz sentido aqui porque só existe um cliente com aquele id.

O novo projeto vira um objeto e é salvo com `adicionarProjeto(novoProjeto)` — e a partir daí, já aparece no painel na próxima vez que `index.html` carregar, porque o painel sempre lê do mesmo `localStorage`.

### 6.6 Uma função que os dois formulários compartilham

```js
function definirErroDeCampo(campo, mensagem) {
  const spanErro = document.getElementById("erro-" + campo.id);
  const wrapper = campo.closest(".field");
  if (mensagem) {
    wrapper.classList.add("has-error");       // ativa o CSS de campo com erro
    campo.setAttribute("aria-invalid", "true"); // acessibilidade
    spanErro.textContent = mensagem;
  } else {
    wrapper.classList.remove("has-error");
    campo.removeAttribute("aria-invalid");
    spanErro.textContent = "";
  }
}
```

Essa função é usada tanto no formulário de cliente quanto no de projeto — em vez de copiar a mesma lógica duas vezes, ela foi escrita uma vez só e reaproveitada (boa prática de programação: evitar duplicar código).

---

## 7. Perguntas que o professor pode fazer (e respostas prontas)

**"Por que localStorage e não um banco de dados de verdade?"**
Porque o projeto é só front-end (sem servidor), e a disciplina, nesta etapa, pedia interatividade em JavaScript puro — `localStorage` é a forma padrão do navegador de dar persistência sem precisar de back-end.

**"O que acontece se eu abrir em outro navegador/computador?"**
Os dados não aparecem — `localStorage` é por navegador e por origem, não é compartilhado entre dispositivos. Isso é uma limitação conhecida e esperada de um projeto só front-end.

**"Por que vocês validam no JavaScript e não só no HTML (`required`)?"**
Os formulários usam `novalidate` de propósito, para desativar a validação automática do navegador e garantir que as mensagens de erro customizadas (mais claras, no idioma e estilo do projeto) sejam sempre as que aparecem.

**"Isso teria algum problema de segurança?"**
Sim — por ser só front-end, qualquer validação pode ser "burlada" abrindo o DevTools; numa aplicação real, a mesma validação precisaria existir também no servidor. Isso fica registrado como próximo passo caso o projeto ganhe um back-end no futuro.

**"Por que vocês escondem o card com `hidden` e não com `display: none` direto?**
`hidden` é um atributo HTML padrão — ele já faz `display: none` sozinho. A única pegadinha (que inclusive apareceu como bug numa versão anterior) é que uma regra de CSS como `.card { display: grid }` pode acidentalmente "vencer" esse comportamento padrão; por isso existe uma regra extra `.card[hidden] { display: none; }` garantindo que a prioridade seja sempre a correta.

**"Me explica um `forEach`/`filter`/`find` que vocês usaram."**
Use os exemplos da seção 6.3 e 6.5 acima — são os mais fáceis de explicar com uma frase cada.

---

## 8. Roteiro sugerido para a demonstração ao vivo

1. Abra `index.html` — mostre o resumo (números) e a lista de projetos.
2. Digite um nome no campo de busca — mostre o filtro em tempo real, sem recarregar.
3. Combine busca + status — mostre que os dois filtros funcionam juntos.
4. Digite algo que não existe — mostre a mensagem de "nenhum resultado".
5. Vá para `cliente.html` — tente salvar vazio, mostre os erros.
6. Cadastre um cliente de verdade — mostre ele aparecendo na lista.
7. Vá para `novo-projeto.html` — abra o `<select>` de cliente e mostre que o cliente que você acabou de cadastrar já está lá.
8. Cadastre um projeto para esse cliente — mostre a mensagem de confirmação.
9. Volte para `index.html` e **atualize a página (F5)** — mostre que o cliente e o projeto novos continuam lá, e que dá pra encontrar o projeto pela busca.

Esse roteiro, nessa ordem, mostra sozinho praticamente todos os requisitos da Etapa 04 sem precisar explicar nada "por fora" — o professor vê o sistema inteiro se comportando como um sistema real.
