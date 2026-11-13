# ETAPA 04: INTERATIVIDADE COM JAVASCRIPT

Esta etapa adiciona comportamento dinâmico ao protótipo responsivo das [Etapa 02](etapa-02.md) e [Etapa 03](etapa-03.md), sem alterar o HTML semântico, o CSS ou a identidade visual já existentes. Todo o JavaScript fica em um único arquivo, compartilhado pelas páginas que precisam dele:

```text
src/js/script.js
```

O arquivo é dividido em três funções de inicialização independentes (uma por página), cada uma verificando se os elementos da sua página existem antes de rodar. Por isso o mesmo `script.js` pode ser incluído em `index.html`, `cliente.html` e `novo-projeto.html` sem gerar erro nas páginas que não usam aquela função.

> **Nota de revisão:** esta versão corrige uma limitação da primeira implementação, em que os dados cadastrados existiam apenas na memória da página aberta e se perdiam ao trocar de página ou atualizar o navegador. Agora os dados persistem em `localStorage`, conforme detalhado na seção "Persistência de dados" abaixo.

## 1. Descrição das funcionalidades interativas

Foram implementadas três funcionalidades interativas, todas usando apenas JavaScript puro (sem frameworks, bibliotecas, banco de dados ou servidor):

1. **Busca e filtragem de projetos** no Painel (`index.html`), agora sobre os dados persistidos.
2. **Validação e cadastro de cliente** (`cliente.html`), com o novo cliente salvo em `localStorage`.
3. **Validação e cadastro de novo projeto** (`novo-projeto.html`), com o projeto salvo em `localStorage` e aparecendo no Painel.

## Persistência de dados

Como o projeto é apenas front-end (sem servidor ou banco de dados), os clientes e projetos cadastrados pelo usuário são guardados no `localStorage` do navegador, em duas chaves:

| Chave | Conteúdo |
|---|---|
| `madeiraflow:clientes` | array com todos os clientes (os originais da proposta + os cadastrados pelo usuário) |
| `madeiraflow:projetos` | array com todos os projetos (os originais do painel + os cadastrados pelo usuário) |

**Na primeira execução** (quando essas chaves ainda não existem), o `script.js` preenche o `localStorage` com os mesmos clientes e projetos que já apareciam no HTML original (funções `obterClientesIniciais()` e `obterProjetosIniciais()`). Isso garante que os dados originais nunca desaparecem. Nas vezes seguintes, o sistema sempre lê o que já está salvo e apenas acrescenta os novos cadastros — o `localStorage` nunca é apagado ou sobrescrito do zero.

Cada cliente e cada projeto tem um `id` único: os três clientes e os quatro projetos originais mantêm ids fixos e legíveis (como `renata-almeida` e `projeto-cozinha`), e os cadastrados pelo usuário recebem um id gerado com `Date.now()` (função `gerarId`), evitando duplicações mesmo que dois registros tenham o mesmo nome.

## Compartilhamento de dados entre páginas

Como as três páginas rodam na mesma origem e usam as mesmas chaves de `localStorage`, o fluxo de dados é:

```text
cliente.html  --(adicionarCliente)-->  localStorage["madeiraflow:clientes"]
                                                  |
                                                  v
novo-projeto.html  --(lê clientes para preencher o <select>)
      |
      v
(adicionarProjeto) --> localStorage["madeiraflow:projetos"]
                                                  |
                                                  v
index.html  --(lê projetos e renderiza os cards + aplica a busca)
```

Ou seja: um cliente cadastrado em `cliente.html` fica disponível para seleção em `novo-projeto.html`, e um projeto cadastrado em `novo-projeto.html` aparece no painel de `index.html` — tudo isso persistindo mesmo depois de fechar e abrir o navegador novamente (dentro das limitações normais do `localStorage`, que é por navegador e por origem).

## 2 e 3. Funcionalidades e como o usuário utiliza cada uma

### Funcionalidade 1: Busca e filtragem de projetos

**Onde:** `src/index.html`, seção "Buscar projetos".

**Como funciona:** ao carregar a página, `carregarProjetos()` lê o `localStorage` (ou usa os dados iniciais, na primeira vez) e `renderizarProjetos()` desenha um card para cada projeto. O usuário digita um termo no campo "Cliente" e/ou escolhe um status no campo "Status"; a cada tecla digitada (evento `input`) ou troca de status (evento `change`), a função `filtrarProjetos()` roda de novo e decide quais cards ficam visíveis, comparando o termo com o nome do cliente e o título do projeto (`card.dataset.cliente` e `card.dataset.titulo`), e o status com `card.dataset.status`. Clicar em "Filtrar" ou apertar Enter dispara o mesmo filtro, sem recarregar a página (o envio do formulário é interceptado com `preventDefault`). Se nenhum projeto corresponder, aparece a mensagem "Não encontramos projetos para essa busca." no lugar dos cards; ela desaparece sozinha assim que algum projeto volta a corresponder à busca.

### Funcionalidade 2: Validação e cadastro de cliente

**Onde:** `src/cliente.html`, formulário "Cadastrar cliente".

**Como funciona:** ao clicar em "Salvar cliente", o JavaScript valida nome, telefone e e-mail antes de aceitar o cadastro. Se algum campo estiver inválido, uma mensagem de erro aparece logo abaixo dele (por exemplo, "Informe o nome do cliente." ou "Use o formato (00) 00000-0000.") e o cadastro não prossegue. Quando os campos estão corretos, `adicionarCliente()` grava o novo cliente no `localStorage` (mantendo os que já existiam) e a lista "Clientes cadastrados" é redesenhada a partir dos dados salvos, com o cliente mais recente aparecendo primeiro. Uma mensagem de sucesso aparece acima do formulário, que é limpo em seguida.

### Funcionalidade 3: Validação e cadastro de novo projeto

**Onde:** `src/novo-projeto.html`, formulário "Dados do projeto".

**Como funciona:** ao carregar a página, `preencherSelectDeClientes()` lê os clientes salvos no `localStorage` (originais + cadastrados em `cliente.html`) e monta as opções do campo "Cliente" dinamicamente, sem duplicar nenhuma. Ao clicar em "Criar projeto", o JavaScript confere se um cliente foi selecionado e se o título e a descrição foram preenchidos; campos inválidos recebem uma mensagem de erro logo abaixo. Quando tudo está correto, `adicionarProjeto()` grava o novo projeto no `localStorage`, uma mensagem de confirmação é exibida (informando título, cliente e status inicial) e o formulário é limpo. Esse projeto passa a aparecer no Painel na próxima vez que `index.html` for aberto ou recarregado.

## 4. Arquivos envolvidos

| Funcionalidade | Arquivos |
|---|---|
| Busca e filtragem de projetos | `src/index.html`, `src/js/script.js` |
| Validação e cadastro de cliente | `src/cliente.html`, `src/js/script.js` |
| Validação e cadastro de novo projeto | `src/novo-projeto.html`, `src/js/script.js` |
| Estilos de erro/sucesso/estado vazio (reaproveitados pelas três) | `src/css/style.css` (classes `.field-error`, `.form-success`, `.empty-state`, já existentes) |

## 5. Conceitos de programação utilizados

* **Manipulação do DOM:** criação de elementos com `document.createElement` (cards de projeto e de cliente, opções do `<select>`), leitura/escrita de `textContent`, `classList.add`/`remove`, `hidden`, `innerHTML = ""` para redesenhar listas, e inserção com `appendChild`.
* **Eventos:** `DOMContentLoaded`, `submit` (com `preventDefault` para não recarregar a página), `input` e `change`.
* **Funções:** o arquivo é organizado em funções pequenas e nomeadas por responsabilidade — `carregarClientes`, `salvarClientes`, `adicionarCliente`, `carregarProjetos`, `salvarProjetos`, `adicionarProjeto`, `renderizarProjetos` (dentro de `initPainelDeProjetos`), `criarCardDeProjeto`, `criarCardDeCliente`, `preencherSelectDeClientes`, `definirErroDeCampo` (reutilizada pelos dois formulários), entre outras.
* **Arrays:** clientes e projetos são sempre arrays de objetos (guardados como JSON no `localStorage`); grupos de campos de formulário também são tratados como arrays, por exemplo `[campoNome, campoTelefone, campoEmail]`.
* **Métodos de iteração:** `filter` (projetos que correspondem à busca; projetos de um cliente específico, para contar "X projetos vinculados"), `forEach` (desenhar cada card, mostrar/ocultar cards, registrar eventos de revalidação) e `find` (localizar o cliente selecionado pelo id, ao criar um novo projeto).
* **Validação:** feita em JavaScript, não apenas pelos atributos nativos do HTML — os formulários de cliente e de projeto usam `novalidate` justamente para que as mensagens customizadas sejam sempre exibidas no lugar das mensagens padrão do navegador.
* **Alteração dinâmica da interface:** cards de projeto e cliente sendo (re)criados a partir dos dados salvos, mensagens de erro/sucesso aparecendo e desaparecendo, cards sendo ocultados/exibidos na busca, opções do `<select>` de cliente sendo reconstruídas.
* **Tratamento de situações inválidas:** busca sem resultado, campos obrigatórios vazios, telefone fora do formato esperado, e-mail com formato inválido, e falha ao ler/gravar no `localStorage` (contida em blocos `try/catch` em `lerDoStorage` e `salvarNoStorage`, para não quebrar a página caso o navegador bloqueie o armazenamento).

## 6. Validações implementadas

| Campo | Página | Regra |
|---|---|---|
| Nome | `cliente.html` | Não pode estar vazio |
| Telefone | `cliente.html` | Não pode estar vazio; deve seguir o formato `(00) 00000-0000` |
| E-mail | `cliente.html` | Se preenchido, deve ter um formato válido (texto@texto.texto) |
| Cliente | `novo-projeto.html` | Deve ser selecionado um cliente da lista |
| Título do projeto | `novo-projeto.html` | Não pode estar vazio |
| Descrição detalhada | `novo-projeto.html` | Não pode estar vazio |

## 7. Situações inválidas e como são tratadas

* **Nome vazio:** mensagem "Informe o nome do cliente." abaixo do campo; o cadastro não é concluído.
* **Telefone vazio ou fora do formato:** mensagem "Informe o telefone do cliente." ou "Use o formato (00) 00000-0000."; o cadastro não é concluído.
* **E-mail com formato inválido:** mensagem "Informe um e-mail válido."; o cadastro não é concluído (o campo continua opcional se deixado em branco).
* **Cliente não selecionado / título ou descrição vazios (novo projeto):** mensagem correspondente abaixo do campo; o projeto não é salvo.
* **Busca sem resultado:** mensagem "Não encontramos projetos para essa busca." é exibida no lugar dos cards.
* **Busca combinando cliente + status sem correspondência:** os dois critérios são aplicados juntos (`&&`); se nenhum projeto atender aos dois ao mesmo tempo, a mesma mensagem de busca sem resultado aparece.

## 8. Como testar

### Busca de projetos (`index.html`)

1. Abra `src/index.html` no navegador.
2. No campo "Cliente", digite `renata` — os projetos de Renata Almeida (Armário e Escrivaninha) devem permanecer visíveis, os demais somem.
3. Apague o texto e, em "Status", escolha "Aprovado" — apenas o projeto com aquele status deve aparecer.
4. Com "Cliente" = `renata` e "Status" = "Entregue" ao mesmo tempo, apenas a Escrivaninha deve aparecer (os dois filtros juntos).
5. Digite algo que não existe, como `xyz123` — deve aparecer "Não encontramos projetos para essa busca."
6. Limpe os campos — todos os projetos voltam a aparecer, e a mensagem de busca sem resultado desaparece.
7. Clique em "Filtrar" (ou aperte Enter) a qualquer momento — a página não deve recarregar.

### Cadastro de cliente (`cliente.html`)

1. Abra `src/cliente.html`.
2. Clique em "Salvar cliente" sem preencher nada — devem aparecer erros abaixo de "Nome completo" e "Telefone".
3. Preencha o telefone com algo fora do formato, como `123` — deve aparecer "Use o formato (00) 00000-0000."
4. Preencha o e-mail com algo inválido, como `teste@` — deve aparecer "Informe um e-mail válido."
5. Preencha com dados válidos (por exemplo, Nome: `João Teste`, Telefone: `(62) 99999-9999`, E-mail: `joao@teste.com`) e clique em "Salvar cliente" — o novo cliente deve aparecer no topo da lista "Clientes cadastrados", com a mensagem de sucesso acima do formulário.
6. Atualize a página (F5) — o cliente "João Teste" deve continuar na lista.

### Novo projeto (`novo-projeto.html`)

1. Abra `src/novo-projeto.html` — "João Teste" (cadastrado no teste anterior) já deve aparecer na lista do campo "Cliente", junto dos clientes originais.
2. Clique em "Criar projeto" sem preencher nada — devem aparecer erros em "Cliente", "Título do projeto" e "Descrição detalhada".
3. Selecione "João Teste", preencha título e descrição, e clique em "Criar projeto" — deve aparecer a mensagem de confirmação acima do formulário.
4. Vá para `src/index.html` — o novo projeto deve aparecer no painel.
5. Pesquise por `joão teste` no campo "Cliente" do painel — o novo projeto deve ser encontrado.
6. Atualize a página (F5) — o novo projeto deve continuar aparecendo.

## Matriz de evidências

| Requisito | Funcionalidade relacionada | Arquivo(s) | Evidência |
|---|---|---|---|
| Manipulação do DOM | Renderização dos cards de projeto e cliente a partir dos dados salvos; reconstrução do `<select>` de clientes | `src/js/script.js` (`criarCardDeProjeto`, `criarCardDeCliente`, `preencherSelectDeClientes`) | Testar o passo 5 do cadastro de cliente e o passo 4 do cadastro de projeto: os elementos aparecem na tela sem recarregar a página |
| Tratamento de eventos | `submit`, `input` e `change` nos três formulários/buscas | `src/js/script.js` (chamadas a `addEventListener`) | Digitar no campo de busca do painel e ver o filtro reagir em tempo real |
| Validação de formulários | Validação de cliente e de novo projeto | `src/js/script.js` (`validarFormulario` em `initFormularioCliente` e `initFormularioProjeto`; `definirErroDeCampo` compartilhada) | Enviar os formulários de `cliente.html` e `novo-projeto.html` vazios e ver as mensagens de erro |
| Alteração dinâmica da interface | Cards novos aparecendo nas listas; mensagens de erro/sucesso; ocultação de cards na busca; opções do select sendo atualizadas | `src/js/script.js`; classes `.field-error`, `.form-success`, `.empty-state` em `src/css/style.css` | Repetir o fluxo completo do teste 4 ao 6 de "Como testar" |
| Uso de funções | Arquivo organizado por responsabilidade | `src/js/script.js` | Ler o código-fonte: funções de armazenamento, de renderização e de validação, cada uma com um nome específico |
| Uso de arrays | Clientes e projetos armazenados como arrays de objetos no `localStorage`; grupos de campos de formulário | `src/js/script.js` (`carregarClientes`, `carregarProjetos`, `[campoNome, campoTelefone, campoEmail]`) | Abrir o DevTools → Application → Local Storage e ver as chaves `madeiraflow:clientes` e `madeiraflow:projetos` |
| Métodos de iteração | `filter` (projetos que correspondem à busca; projetos de um cliente), `forEach` (desenhar/ocultar cards, registrar eventos) e `find` (localizar cliente selecionado) | `src/js/script.js` | Ler o código-fonte de `filtrarProjetos`, `criarCardDeCliente` e do `submit` de `initFormularioProjeto` |
| Tratamento de situações inválidas | Busca sem resultado; combinação cliente+status sem correspondência; campos obrigatórios vazios; telefone/e-mail inválidos; falha de leitura/gravação no `localStorage` | `src/js/script.js`, `src/index.html`, `src/cliente.html`, `src/novo-projeto.html` | Seguir os testes 2 a 6 de "Como testar" em cada página |

## Evidências

A orientação para as capturas de tela desta etapa está em [`docs/evidencias/etapa-04/README.md`](evidencias/etapa-04/README.md). As capturas em si não foram geradas automaticamente; precisam ser feitas manualmente pelo aluno, seguindo o passo a passo descrito naquele arquivo.
