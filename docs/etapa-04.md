# ETAPA 04: INTERATIVIDADE COM JAVASCRIPT

A Etapa 04 adiciona comportamento dinâmico ao protótipo responsivo das [Etapas 02](etapa-02.md) e [03](etapa-03.md), mantendo o HTML semântico, o CSS e a identidade visual definidos anteriormente. Todo o JavaScript utilizado pelas páginas interativas está concentrado em:

```text
src/js/script.js
```

O arquivo é organizado em funções de inicialização independentes para o painel, o cadastro de clientes e o cadastro de projetos. Cada inicialização verifica a existência dos elementos correspondentes antes de executar, permitindo o compartilhamento do mesmo arquivo entre `index.html`, `cliente.html` e `novo-projeto.html`.

> **Registro de revisão:** a implementação atual utiliza `localStorage` para manter clientes e projetos entre páginas e atualizações do navegador. Essa solução substitui a primeira implementação, na qual os dados cadastrados ficavam restritos à memória da página aberta.

## 1. Funcionalidades interativas implementadas

Foram implementadas três funcionalidades interativas, utilizando JavaScript puro, sem frameworks, bibliotecas, banco de dados ou servidor: 

1. **Busca e filtragem de projetos** no Painel (`index.html`), utilizando os dados persistidos.
2. **Validação e cadastro de cliente** (`cliente.html`), com persistência do novo registro.
3. **Validação e cadastro de novo projeto** (`novo-projeto.html`), com persistência do projeto e integração com o Painel.

## Persistência de dados

Como a implementação atual é exclusivamente front-end, os clientes e projetos cadastrados são armazenados no `localStorage` do navegador, utilizando duas chaves:

| Chave | Conteúdo |
|---|---|
| `madeiraflow:clientes` | Array com os clientes originais e os novos clientes cadastrados. |
| `madeiraflow:projetos` | Array com os projetos originais e os novos projetos cadastrados. |

Na primeira execução, quando as chaves ainda não existem, o `script.js` inicializa o armazenamento com os mesmos clientes e projetos presentes no conteúdo original do sistema, por meio das funções `obterClientesIniciais()` e `obterProjetosIniciais()`. Nas execuções seguintes, os dados existentes são preservados e os novos registros são acrescentados.

Cada cliente e projeto possui um identificador único. Os registros originais utilizam identificadores fixos e os novos registros recebem identificadores gerados pela função `gerarId`, baseada em `Date.now()`.

## Compartilhamento de dados entre páginas

As três páginas utilizam as mesmas chaves de `localStorage`, formando o seguinte fluxo de dados:

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

Dessa forma, um cliente cadastrado em `cliente.html` fica disponível em `novo-projeto.html`, enquanto um projeto cadastrado em `novo-projeto.html` passa a integrar o painel de `index.html`. A persistência permanece disponível após atualizações ou reabertura do navegador, respeitando as características do `localStorage`, que é associado ao navegador e à origem da aplicação.

## 2. Funcionalidade 1: Busca e filtragem de projetos

**Onde:** `src/index.html`, seção "Buscar projetos".

**Comportamento:** ao carregar a página, `carregarProjetos()` consulta o `localStorage` e `renderizarProjetos()` cria um card para cada projeto. O campo "Cliente" aceita um termo de pesquisa e o campo "Status" define um filtro adicional. Os eventos `input` e `change` acionam `filtrarProjetos()`, que compara o termo com o nome do cliente e o título do projeto e verifica o status selecionado. O botão "Filtrar" e o envio pelo Enter utilizam o mesmo mecanismo sem recarregar a página, graças ao `preventDefault`.

Quando nenhum projeto corresponde aos critérios, a interface apresenta a mensagem **"Não encontramos projetos para essa busca."** no lugar dos cards. A mensagem é removida quando a busca volta a encontrar registros.

## 3. Funcionalidade 2: Validação e cadastro de cliente

**Onde:** `src/cliente.html`, formulário "Cadastrar cliente".

**Comportamento:** o JavaScript valida nome, telefone e e-mail antes de concluir o cadastro. Campos inválidos recebem mensagens de erro específicas e impedem a gravação. Com dados válidos, `adicionarCliente()` grava o novo registro no `localStorage`, preserva os registros existentes e atualiza a lista de clientes, exibindo o cadastro mais recente primeiro. Uma mensagem de sucesso é apresentada e o formulário é limpo.

## 4. Funcionalidade 3: Validação e cadastro de novo projeto

**Onde:** `src/novo-projeto.html`, formulário "Dados do projeto".

**Comportamento:** `preencherSelectDeClientes()` consulta os clientes armazenados e monta dinamicamente as opções do campo "Cliente", incluindo os registros cadastrados posteriormente em `cliente.html`. No envio do formulário, o JavaScript valida cliente, título e descrição. Com dados válidos, `adicionarProjeto()` grava o novo projeto no `localStorage`, apresenta a confirmação do cadastro e limpa o formulário. O projeto passa a integrar o painel de `index.html`.

## 5. Arquivos envolvidos

| Funcionalidade | Arquivos |
|---|---|
| Busca e filtragem de projetos | `src/index.html`, `src/js/script.js` |
| Validação e cadastro de cliente | `src/cliente.html`, `src/js/script.js` |
| Validação e cadastro de novo projeto | `src/novo-projeto.html`, `src/js/script.js` |
| Estilos de erro, sucesso e estado vazio | `src/css/style.css` |

## 6. Conceitos de programação utilizados

* **Manipulação do DOM:** criação de elementos com `document.createElement`, leitura e escrita de `textContent`, uso de `classList`, `hidden`, `innerHTML` e `appendChild`.
* **Eventos:** `DOMContentLoaded`, `submit`, `input` e `change`, com `preventDefault` nos formulários.
* **Funções:** organização por responsabilidade, incluindo `carregarClientes`, `salvarClientes`, `adicionarCliente`, `carregarProjetos`, `salvarProjetos`, `adicionarProjeto`, `renderizarProjetos`, `criarCardDeProjeto`, `criarCardDeCliente`, `preencherSelectDeClientes` e `definirErroDeCampo`.
* **Arrays:** clientes e projetos são armazenados como arrays de objetos serializados em JSON no `localStorage`.
* **Métodos de iteração:** `filter`, `forEach` e `find` são utilizados para filtragem, renderização, registro de eventos e localização de clientes.
* **Validação:** os formulários utilizam validação própria em JavaScript, com `novalidate`, permitindo mensagens específicas para cada situação inválida.
* **Alteração dinâmica da interface:** criação e atualização de cards, mensagens de erro e sucesso, estados vazios e opções do campo de seleção de clientes.
* **Tratamento de situações inválidas:** busca sem resultado, campos obrigatórios vazios, telefone ou e-mail inválidos e falhas de leitura ou gravação no `localStorage`, tratadas por `try/catch`.

## 7. Validações implementadas

| Campo | Página | Regra |
|---|---|---|
| Nome | `cliente.html` | Não pode estar vazio. |
| Telefone | `cliente.html` | Não pode estar vazio; deve seguir o formato `(00) 00000-0000`. |
| E-mail | `cliente.html` | Quando preenchido, deve apresentar formato válido. |
| Cliente | `novo-projeto.html` | Deve ser selecionado um cliente da lista. |
| Título do projeto | `novo-projeto.html` | Não pode estar vazio. |
| Descrição detalhada | `novo-projeto.html` | Não pode estar vazio. |

## 8. Situações inválidas e tratamento

* **Nome vazio:** exibição da mensagem "Informe o nome do cliente." e bloqueio do cadastro.
* **Telefone vazio ou fora do formato:** exibição da mensagem correspondente e bloqueio do cadastro.
* **E-mail inválido:** exibição da mensagem "Informe um e-mail válido." e bloqueio do cadastro.
* **Cliente não selecionado, título ou descrição vazios:** exibição da mensagem correspondente e bloqueio do cadastro do projeto.
* **Busca sem resultado:** exibição da mensagem "Não encontramos projetos para essa busca.".
* **Busca combinando cliente e status sem correspondência:** aplicação simultânea dos critérios e exibição do estado de busca sem resultado quando nenhum registro atende a ambos.

## 9. Validação funcional registrada

A funcionalidade foi verificada por cenários que cobrem o comportamento normal e as situações inválidas previstas na implementação:

| Cenário | Resultado esperado registrado |
|---|---|
| Busca por `renata` | Permanecem visíveis os projetos de Renata Almeida. |
| Filtro por status `Aprovado` | Permanecem visíveis os projetos com o status selecionado. |
| Busca por `renata` + status `Entregue` | Permanece visível a Escrivaninha de Renata Almeida. |
| Termo inexistente, como `xyz123` | Exibição de "Não encontramos projetos para essa busca.". |
| Limpeza dos filtros | Retorno da listagem completa. |
| Envio do filtro | Aplicação sem recarregar a página. |
| Formulário de cliente vazio | Exibição dos erros de nome e telefone. |
| Telefone `123` | Exibição do erro de formato do telefone. |
| E-mail `teste@` | Exibição do erro de formato do e-mail. |
| Cadastro de cliente válido | Inclusão do novo cliente no topo da lista e mensagem de sucesso. |
| Atualização da página após cadastro | Permanência do cliente armazenado. |
| Cliente recém-cadastrado no novo projeto | Disponibilidade do cliente no campo de seleção. |
| Novo projeto sem dados obrigatórios | Exibição dos erros correspondentes. |
| Cadastro de projeto válido | Exibição da confirmação e persistência do projeto. |
| Projeto recém-criado no painel | Inclusão do projeto na listagem de `index.html`. |
| Atualização da página após cadastro | Permanência do projeto armazenado. |

## 10. Matriz de evidências

| Requisito | Funcionalidade relacionada | Arquivo(s) | Evidência registrada |
|---|---|---|---|
| Manipulação do DOM | Renderização dos cards de projeto e cliente e reconstrução do `<select>` de clientes | `src/js/script.js` | Evidências de cadastro e integração entre páginas |
| Tratamento de eventos | `submit`, `input` e `change` | `src/js/script.js` | Evidência da busca e dos formulários interativos |
| Validação de formulários | Validação de cliente e novo projeto | `src/js/script.js` | Evidências de validações inválidas |
| Alteração dinâmica da interface | Cards, mensagens, estados vazios e opções do `<select>` | `src/js/script.js`, `src/css/style.css` | Evidências de busca, cadastro e integração |
| Uso de funções | Funções de armazenamento, renderização e validação | `src/js/script.js` | Estrutura funcional do código |
| Uso de arrays | Clientes e projetos armazenados como arrays de objetos | `src/js/script.js` | Estrutura das chaves de `localStorage` |
| Métodos de iteração | `filter`, `forEach` e `find` | `src/js/script.js` | Implementação das rotinas de filtragem e renderização |
| Tratamento de situações inválidas | Busca sem resultado, campos inválidos e falhas de armazenamento | `src/js/script.js`, `src/index.html`, `src/cliente.html`, `src/novo-projeto.html` | Evidências de estados inválidos e mensagens do sistema |

## Evidências

As evidências visuais da Etapa 04 estão reunidas em [`docs/evidencias/etapa-04/README.md`](evidencias/etapa-04/README.md). O conjunto registra busca com resultado, validações, cadastro de cliente, busca sem resultado, integração do cliente com o cadastro de projeto e inclusão do projeto no painel.
