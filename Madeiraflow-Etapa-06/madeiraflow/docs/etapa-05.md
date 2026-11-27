# ETAPA 05: MODULARIZAÇÃO E COMUNICAÇÃO ASSÍNCRONA

Esta etapa evolui o sistema da [Etapa 04](etapa-04.md) em duas frentes: o JavaScript, antes concentrado em um único arquivo, passa a ser dividido em módulos ES6 com responsabilidades separadas; e os dados, antes guardados no `localStorage` do navegador, passam a ser consultados e enviados a uma API simulada por meio de requisições assíncronas. O HTML, o CSS, o visual, a responsividade, as validações, os filtros e a navegação foram preservados.

## 1. O que foi implementado

* **Modularização:** o antigo `src/js/script.js` foi substituído por módulos ES6 (`import`/`export`) organizados em `services/`, `modules/` e `utils/`, com `main.js` como ponto de entrada.
* **Comunicação assíncrona:** Fetch API com `async/await` e `Promise.all`, centralizada em um único arquivo (`services/api.js`).
* **Consulta (GET):** clientes e projetos são buscados na API e exibidos na interface.
* **Envio (POST):** novos clientes e novos projetos são enviados à API.
* **Estados de carregamento:** "Carregando projetos...", "Carregando clientes...", select de clientes desabilitado com "Carregando clientes..." e botões que mostram "Salvando..." durante o envio.
* **Tratamento de erros:** mensagens exibidas na própria interface para falha ao consultar ou ao salvar, com botão "Tentar novamente" nas consultas.
* **Tratamento de sucesso:** confirmação após consultas (quantidade de itens carregados) e após cadastros.
* **API simulada com persistência:** um servidor local em Node.js, sem dependências externas, que entrega as páginas e responde às requisições em `/api`, gravando os dados em arquivo.
* **Migração:** os clientes e projetos cadastrados na Etapa 04 (que estavam no `localStorage`) são enviados automaticamente ao servidor na primeira abertura, sem duplicar os dados originais.

## 2. Estrutura de pastas

```text
madeiraflow/
├── package.json                    (scripts "start" e "resetar")
├── .gitignore
├── README.md
├── servidor/
│   ├── servidor.js                 (páginas + API simulada)
│   ├── dados.inicial.json          (clientes e projetos originais)
│   └── dados.json                  (gerado na 1ª execução; guarda os cadastros)
├── docs/
│   └── ...
└── src/
    ├── index.html
    ├── cliente.html
    ├── novo-projeto.html
    ├── projeto-*.html              (4 páginas de detalhe, sem alteração)
    ├── css/
    │   └── style.css
    └── js/
        ├── main.js
        ├── services/
        │   ├── api.js
        │   ├── clienteService.js
        │   ├── projetoService.js
        │   └── migracaoService.js
        ├── modules/
        │   ├── painel.js
        │   ├── clientes.js
        │   └── projetos.js
        └── utils/
            ├── interface.js
            ├── validacao.js
            └── storage.js
```

## 3. Responsabilidade de cada módulo

| Arquivo | Responsabilidade |
|---|---|
| `main.js` | Ponto de entrada. Executa a migração dos dados antigos e inicia os módulos de tela. Cada módulo confere se os elementos da sua página existem, então só o que se aplica à página aberta é executado. |
| `services/api.js` | Único ponto que usa `fetch`. Define `obter` (GET) e `enviar` (POST), com tempo limite de 8 segundos (`AbortController`) e a classe `ErroDeApi`, que padroniza falhas de rede, tempo esgotado, erro HTTP e resposta ilegível. |
| `services/clienteService.js` | Operações de clientes: `listarClientes` (GET `/api/clientes`) e `cadastrarCliente` (POST `/api/clientes`). |
| `services/projetoService.js` | Operações de projetos: `listarProjetos` (GET `/api/projetos`) e `cadastrarProjeto` (POST `/api/projetos`). |
| `services/migracaoService.js` | Envia ao servidor os dados que a Etapa 04 deixou no `localStorage` e só os remove do navegador depois do envio bem-sucedido. |
| `modules/painel.js` | Painel de projetos: carrega e desenha os cards, mantém os filtros por cliente e status e exibe os estados de carregamento, sucesso e erro. |
| `modules/clientes.js` | Página de clientes: carrega a lista, valida o formulário, envia o novo cliente e atualiza a lista após o sucesso. |
| `modules/projetos.js` | Página de novo projeto: carrega os clientes para o campo de seleção, valida o formulário e envia o novo projeto. |
| `utils/validacao.js` | Regras de validação reutilizáveis (nome, telefone, e-mail, seleção de cliente, título e descrição). |
| `utils/interface.js` | Elementos de interface compartilhados: áreas de estado (carregando, erro, sucesso), botão ocupado ("Salvando...") e feedback dos campos com erro. |
| `utils/storage.js` | Acesso seguro ao `localStorage`, usado apenas na migração dos dados antigos. |

## 4. Tecnologia utilizada na comunicação assíncrona

* **Fetch API** para as requisições HTTP, com **`async/await`** para escrever o fluxo de forma sequencial e **`try/catch/finally`** para tratar sucesso, erro e encerramento do carregamento.
* **`Promise.all`** na página de clientes, que consulta clientes e projetos em paralelo.
* **`AbortController`** para cancelar requisições que demoram mais que o tempo limite.
* **API simulada** em Node.js (`servidor/servidor.js`), usando apenas módulos nativos (`http`, `fs`, `path`). Ela responde com JSON, valida os dados recebidos, usa códigos HTTP adequados (200, 201, 400, 404, 405, 422, 503) e grava os dados em `servidor/dados.json`. Também aplica um atraso artificial às respostas (800 ms por padrão), comportamento comum em serviços simulados, para que os indicadores de carregamento fiquem visíveis.

Os dados não são estáticos: o que aparece nas telas é o que o servidor devolve, e o que é cadastrado fica salvo no arquivo do servidor.

## 5. Como executar

Requisito: Node.js 16 ou superior. Não há dependências para instalar.

```bash
npm start
```

Em seguida, abrir [http://localhost:3000](http://localhost:3000) no navegador. No Windows, o arquivo `iniciar.bat` faz o mesmo com dois cliques (executa `node servidor\servidor.js` e abre o navegador) e o `resetar-dados.bat` restaura os dados iniciais. O servidor é necessário por dois motivos: módulos ES6 (`<script type="module">`) não funcionam quando o HTML é aberto diretamente (`file://`), e é ele que responde às requisições da API.

Opções (o `--` repassa os argumentos ao script):

| Comando | Efeito |
|---|---|
| `npm start -- --porta=3001` | Usa outra porta |
| `npm start -- --atraso=2000` | Altera o atraso simulado das respostas, em milissegundos (`--atraso=0` desativa) |
| `npm run resetar` | Restaura os dados iniciais (apaga os cadastros feitos) |

Para encerrar o servidor: `Ctrl+C` no terminal.

## 6. Operações da API

| Método | Endereço | Descrição | Respostas |
|---|---|---|---|
| GET | `/api/clientes` | Lista os clientes | 200 com a lista |
| POST | `/api/clientes` | Cadastra um cliente (`nome`, `telefone`, `email`) | 201 com o cliente criado; 422 se os dados forem inválidos |
| GET | `/api/projetos` | Lista os projetos | 200 com a lista |
| POST | `/api/projetos` | Cadastra um projeto (`clienteId`, `titulo`, `ambiente`, `descricao`, `status`) | 201 com o projeto criado; 422 se os dados forem inválidos ou o cliente não existir |
| POST | `/api/migracao` | Recebe os dados antigos do `localStorage` e incorpora ao servidor sem duplicar (comparação pelo `id`) | 200 com a quantidade importada |

O `id`, o nome do cliente associado ao projeto, o rótulo do status e a data de criação são definidos pelo servidor. Para a demonstração de falhas existem ainda `/api/_simulacao/falha`, `/api/_simulacao/normal` e `/api/_simulacao/status` (ver seção 9).

## 7. Persistência e migração

Os dados ficam em `servidor/dados.json`, criado na primeira execução a partir de `servidor/dados.inicial.json` (os 3 clientes e 4 projetos originais). Por isso os cadastros permanecem após atualizar a página, fechar o navegador ou reiniciar o servidor.

Como o `localStorage` deixou de ser usado como fonte de dados, evita-se manter duas cópias que poderiam divergir. Quando o sistema abre em um navegador que ainda tem os dados da Etapa 04, `migracaoService.js` os envia a `/api/migracao`; o servidor incorpora apenas o que ainda não existe (os clientes e projetos originais têm o mesmo `id` nos dois lados e não são duplicados) e, só depois da resposta de sucesso, as chaves antigas são removidas do navegador. Se o servidor estiver indisponível nesse momento, nada é apagado e a migração é tentada de novo no próximo carregamento.

## 8. Estados de carregamento

| Situação | Indicador exibido | Quando desaparece |
|---|---|---|
| Abertura do Painel | "Carregando projetos..." acima da lista | Ao chegar a resposta, com sucesso ou erro |
| Abertura da página de clientes | "Carregando clientes..." acima da lista | Ao chegar a resposta, com sucesso ou erro |
| Abertura de Novo projeto | Campo "Cliente" desabilitado, exibindo "Carregando clientes..." | Ao chegar a resposta, com sucesso ou erro |
| Cadastro de cliente | Botão "Salvando..." (desabilitado) | Ao chegar a resposta, com sucesso ou erro |
| Cadastro de projeto | Botão "Salvando..." (desabilitado) | Ao chegar a resposta, com sucesso ou erro |

A remoção dos indicadores acontece em blocos `finally`, de modo que nenhum fica preso na tela mesmo quando a operação falha. Com o atraso simulado de 800 ms os indicadores permanecem visíveis tempo suficiente para serem observados; `--atraso=3000` os prolonga.

## 9. Tratamento de erros e como provocá-los

| Falha | Mensagem exibida | Recuperação |
|---|---|---|
| Consulta dos projetos | "Não foi possível carregar os projetos. Tente novamente." | Botão "Tentar novamente" |
| Consulta dos clientes (lista) | "Não foi possível carregar os clientes. Tente novamente." | Botão "Tentar novamente" |
| Consulta dos clientes (campo de Novo projeto) | "Não foi possível carregar os clientes." | Botão "Tentar novamente" |
| Cadastro de cliente | "Ocorreu um erro ao salvar o cliente." | O formulário mantém os dados digitados para reenvio |
| Cadastro de projeto | "Não foi possível cadastrar o projeto." | O formulário mantém os dados digitados para reenvio |

Quando o servidor recusa os dados (422), a mensagem específica enviada por ele é exibida no lugar da mensagem padrão.

Formas de provocar e verificar a falha:

1. **Falha simulada (servidor no ar):** acessar `http://localhost:3000/api/_simulacao/falha`. A partir daí toda a API responde 503. Ao abrir ou atualizar o Painel, aparece a mensagem de erro com o botão "Tentar novamente". Em seguida, acessar `http://localhost:3000/api/_simulacao/normal` e clicar em "Tentar novamente": os projetos são carregados sem recarregar a página.
2. **Servidor desligado:** com a página aberta, encerrar o servidor (`Ctrl+C`) e acionar "Tentar novamente" ou um cadastro: a requisição falha na rede e a mensagem aparece. Ao religar o servidor (`npm start`), a nova tentativa funciona.
3. **Resposta lenta demais:** `npm start -- --atraso=10000` faz o servidor responder depois do tempo limite de 8 segundos, o que gera o erro de tempo esgotado.

## 10. Demonstração dos requisitos da etapa

| Requisito | Onde ver |
|---|---|
| Consulta | Abrir o Painel: o DevTools (aba Network) mostra `GET /api/projetos` e os cards são desenhados com a resposta |
| Operação submetida ao servidor | Cadastrar um cliente em Clientes: `POST /api/clientes` com resposta 201, e o cliente aparece na lista |
| Tratamento de sucesso | Mensagem "Cliente cadastrado com sucesso!", confirmação do projeto cadastrado e "N projetos carregados." |
| Tratamento de erro | Seção 9: mensagem na interface e botão "Tentar novamente" |
| Tratamento de carregamento | Seção 8: indicadores durante as requisições e remoção ao final |
| Módulos | Estrutura da seção 2 e `import`/`export` em `src/js` |
| Persistência | Atualizar a página (F5) ou reiniciar o servidor: os cadastros continuam |

## 11. Preservação da Etapa 04

Permanecem inalterados: a identidade visual e a responsividade, os cards de projeto, os filtros por cliente e status (incluindo a combinação dos dois e a mensagem "Não encontramos projetos para essa busca."), as validações de nome, telefone e e-mail, as mensagens de sucesso, os vínculos entre clientes e projetos (inclusive a contagem de projetos por cliente), as páginas de detalhe de cada projeto e a navegação. As mudanças no HTML se limitaram à troca do `<script>` pelo módulo `main.js`, à retirada dos cards e das opções de cliente que estavam escritos fixos (agora vêm da API) e à inclusão dos campos de mensagem de erro dos formulários. No CSS foram acrescentados apenas os estilos dos novos estados (carregamento, erro, botão desabilitado) e as cores translúcidas passaram a ser variáveis, com comentários indicando onde cada cor é usada.

## 12. Evidências

As capturas de tela desta etapa estão em [`docs/evidencias/etapa-05/`](evidencias/etapa-05/) e mostram a consulta (GET), o envio (POST), os indicadores de carregamento e as mensagens de sucesso.
