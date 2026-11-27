# Etapa 07 — Persistência e CRUD com SQLite

## 1. Introdução

A Etapa 07 substitui o arquivo JSON usado como armazenamento principal na Etapa 06 por uma base SQLite. Os endpoints HTTP e os módulos de interface da Etapa 06 foram mantidos; a API passou a usar os serviços e repositórios do banco. O servidor inicializa o esquema, carrega os cadastros iniciais na primeira execução e preserva as alterações entre reinicializações.

## 2. Escolha do banco

O projeto usa **SQLite** com o pacote `better-sqlite3`. SQLite guarda as tabelas num arquivo local, então a aplicação não precisa de um serviço de banco separado nem de credenciais de conexão. O banco relacional representa diretamente os clientes e os projetos relacionados. `better-sqlite3` fornece consultas preparadas, transações e acesso direto ao SQLite a partir do Node.js ([documentação oficial do pacote](https://github.com/WiseLibs/better-sqlite3)).

Essa dependência requer Node.js 22 ou superior. O arquivo de dependências fixa a faixa instalada e o `package-lock.json` registra a versão resolvida para `npm install`. O pacote inclui binários pré-compilados para as plataformas principais ([instruções oficiais](https://github.com/WiseLibs/better-sqlite3)); `.npmrc` evita que `npm install` tente compilar o driver com `node-gyp`, que exigiria ferramentas C++ no Windows.

## 3. Modelo do banco

O arquivo de banco é `servidor/madeiraflow.sqlite`. O DDL reproduzível está em `servidor/database/schema.sql`; o módulo `servidor/database/connection.js` abre o banco, ativa as chaves estrangeiras, define `busy_timeout`, usa WAL com sincronização `FULL`, aplica o esquema e carrega os dados iniciais uma única vez.

| Tabela | Campo | Tipo SQLite | Regra |
|---|---|---|---|
| `clientes` | `id` | TEXT | Chave primária |
| `clientes` | `nome` | TEXT | Obrigatório e não vazio |
| `clientes` | `telefone` | TEXT | Obrigatório |
| `clientes` | `email` | TEXT | Obrigatório no banco; string vazia representa e-mail opcional |
| `clientes` | `criado_em` | TEXT | Data gerada pelo SQLite |
| `projetos` | `id` | TEXT | Chave primária |
| `projetos` | `titulo` | TEXT | Obrigatório e não vazio |
| `projetos` | `cliente_id` | TEXT | Chave estrangeira obrigatória |
| `projetos` | `ambiente` | TEXT | Opcional; string vazia por padrão |
| `projetos` | `descricao` | TEXT | Obrigatória e não vazia |
| `projetos` | `status` | TEXT | Valor limitado aos cinco status aceitos |
| `projetos` | `data_criacao` | TEXT | Data apresentada pela aplicação |
| `projetos` | `link` | TEXT | Caminho da página de detalhe; vazio para registros novos |

Há índices em `projetos(cliente_id)` e `projetos(status)`. A tabela interna `app_meta` guarda marcadores de inicialização e de migração para que cadastros não sejam inseridos novamente em cada abertura.

## 4. Entidades

**Clientes** guarda o identificador, nome, telefone e e-mail de cada cliente. O e-mail é opcional na API; quando ausente, é salvo como string vazia.

**Projetos** guarda título, ambiente, descrição, status, data e link de detalhe. A consulta da API usa um `JOIN` para devolver também `clienteNome`, mantendo esse nome como dado derivado da tabela `clientes` em vez de duplicá-lo na tabela de projetos. O `statusLabel` usado pela interface também é calculado pelo serviço a partir do `status`.

## 5. Relacionamento e integridade

Um cliente pode estar relacionado a zero ou vários projetos (`CLIENTES 1:N PROJETOS`); cada projeto pertence a exatamente um cliente. A coluna `projetos.cliente_id` referencia `clientes.id` com `ON UPDATE CASCADE ON DELETE RESTRICT`. `PRAGMA foreign_keys = ON` é ativado em cada conexão, e há um índice nessa chave estrangeira.

A API também verifica a existência do cliente antes de criar ou atualizar um projeto, retornando 422 para um `clienteId` inexistente. Ao excluir cliente com projetos, a camada de serviço responde 409 e o próprio banco mantém o `RESTRICT` como segunda barreira. Para apagar os dois registros, exclua primeiro os projetos vinculados.

Diagrama legível: [`modelo-banco.png`](modelo-banco.png). Fonte editável em Mermaid: [`modelo-banco.mmd`](modelo-banco.mmd).

## 6. Organização do código

| Responsabilidade | Arquivo |
|---|---|
| Inicialização/conexão, migração inicial e esquema | `servidor/database/connection.js`, `servidor/database/schema.sql` |
| Consultas SQL preparadas | `servidor/repositories/clientesRepository.js`, `servidor/repositories/projetosRepository.js` |
| Validações e regras de negócio | `servidor/services/clientesService.js`, `servidor/services/projetosService.js` |
| Compatibilidade da migração do localStorage | `servidor/services/migracaoService.js` |
| Rotas HTTP, envelopes JSON e conversão de erros | `servidor/controllers/apiController.js` |
| Servidor HTTP e arquivos estáticos | `servidor/servidor.js` |

Os repositórios executam SQL; os serviços aplicam regras e chamam os repositórios; o controlador traduz HTTP e respostas da API. A página e os serviços front-end continuam se comunicando pelas mesmas URLs da Etapa 06.

## 7. Operações CRUD

As rotas continuam sendo `/api/clientes` e `/api/projetos`, com GET de lista, GET por `:id`, POST, PUT por `:id` e DELETE por `:id`. POST responde 201; GET/PUT respondem 200; DELETE responde 204. As respostas de dados seguem o envelope `{ "dados": ... }` e erros o envelope `{ "erro": { "codigo", "mensagem", "detalhes" } }`.

Criar e consultar cliente:

```sh
curl -X POST http://localhost:3000/api/clientes -H "Content-Type: application/json" \
  -d '{"nome":"Lia Costa","telefone":"(11) 98888-1212","email":"lia@example.com"}'
curl http://localhost:3000/api/clientes
curl http://localhost:3000/api/clientes/cliente-ID-RETORNADO
```

Atualizar e excluir cliente:

```sh
curl -X PUT http://localhost:3000/api/clientes/cliente-ID -H "Content-Type: application/json" \
  -d '{"nome":"Lia Costa Lima","telefone":"(11) 98888-1212","email":"lia@example.com"}'
curl -i -X DELETE http://localhost:3000/api/clientes/cliente-ID
```

Criar, consultar, atualizar e excluir projeto (use o ID de um cliente existente):

```sh
curl -X POST http://localhost:3000/api/projetos -H "Content-Type: application/json" \
  -d '{"clienteId":"cliente-ID","titulo":"Estante planejada","ambiente":"Sala","descricao":"Estante sob medida","status":"orcamento"}'
curl http://localhost:3000/api/projetos
curl http://localhost:3000/api/projetos/projeto-ID
curl -X PUT http://localhost:3000/api/projetos/projeto-ID -H "Content-Type: application/json" \
  -d '{"clienteId":"cliente-ID","titulo":"Estante atualizada","ambiente":"Sala","descricao":"Com nichos e portas","status":"aprovado"}'
curl -i -X DELETE http://localhost:3000/api/projetos/projeto-ID
```

Os serviços mantêm as regras HTTP da etapa anterior: formato de cliente inválido retorna 422, cliente associado impede exclusão com 409, registro inexistente retorna 404, JSON inválido retorna 400, rota inexistente retorna 404 e método não permitido retorna 405. Erros inesperados do SQLite viram uma resposta genérica 500; banco ocupado retorna 503. Mensagens técnicas são registradas apenas no console do servidor.

## 8. Persistência e migração

O banco fica em `servidor/madeiraflow.sqlite` e está incluído com os dados iniciais. A API grava diretamente nesse arquivo. WAL, sincronização completa e transações para carga inicial/migração protegem as alterações e mantêm a integridade. Encerrar e reabrir o processo não apaga o arquivo.

Na primeira inicialização de um banco sem marcadores, a aplicação importa `servidor/dados.json` se ele existir (formato da Etapa 06); caso contrário, carrega `servidor/dados.inicial.json`. IDs são mantidos. Na importação do JSON antigo, `ON CONFLICT DO UPDATE` preserva alterações feitas aos registros iniciais na Etapa 06 sem duplicá-los. Projetos legados sem um cliente válido são ignorados para não criar referências órfãs. Se um banco já inicializado vier junto de um `dados.json` legado, esse JSON ainda é importado uma única vez. Os marcadores ficam em `app_meta`.

A migração de clientes e projetos que ainda estejam no `localStorage` da Etapa 04 também continua disponível em `/api/migracao`; ela usa transação, preserva IDs e pula duplicatas ou projetos sem cliente existente.

## 9. Instalação e execução

Requisitos: Node.js 22 ou superior e npm. Na pasta do projeto:

```sh
npm install
npm start
```

Abra `http://localhost:3000`. O esquema é aplicado automaticamente ao iniciar. Para executar os testes automatizados: `npm test`. Para apagar os dados adicionados e recriar o banco com os registros iniciais: `npm run resetar` (operação destrutiva intencional). O caminho do banco pode ser trocado para testes com a variável `DATABASE_PATH`; o caminho opcional de dados JSON legado é `LEGACY_JSON_PATH`.

## 10. Testes executados

`npm test` inicializa servidores e bancos temporários isolados. A suíte verifica que o arquivo SQLite entregue contém os registros iniciais, que a página HTML continua servida, as rotas CRUD de clientes e projetos, corpos inválidos, IDs ausentes, cliente associado, tentativa de inserir diretamente uma FK inválida, `PRAGMA foreign_key_check`, cabeçalho 405, leitura das linhas no SQLite, erro 503 sob bloqueio real de escrita, migração da rota localStorage, migração de um JSON da Etapa 06 tanto em banco vazio quanto em banco já inicializado, atualização de registros existentes e prevenção de duplicações após reiniciar.

O teste final foi executado com sucesso, incluindo uma instalação limpa com `npm ci`: **CRUD no SQLite, página HTML, validações, FK, erros HTTP e de persistência, importação dos dados antigos e persistência após reiniciar**. As operações de alteração também são consultadas após o reinício; a alteração permanece no arquivo do banco.

## 11. Auditoria dos requisitos

| Requisito | Implementado? | Testado? | Arquivo relacionado |
|---|---|---|---|
| Utilização de banco de dados | Sim | Sim | `servidor/database/connection.js`, `servidor/madeiraflow.sqlite` |
| Duas entidades relacionadas | Sim | Sim | `servidor/database/schema.sql` |
| Criação de registros | Sim | Sim | `servidor/services/`, `tests/api.test.js` |
| Consulta de registros | Sim | Sim | `servidor/repositories/`, `tests/api.test.js` |
| Atualização de registros | Sim | Sim | `servidor/services/`, `tests/api.test.js` |
| Exclusão de registros | Sim | Sim | `servidor/services/`, `tests/api.test.js` |
| Persistência entre reinicializações | Sim | Sim | `servidor/database/connection.js`, `tests/api.test.js` |
| Validação de entradas | Sim | Sim | `servidor/services/`, `tests/api.test.js` |
| Tratamento de erros de persistência | Sim | Sim | `servidor/controllers/apiController.js`, `tests/api.test.js` |
| Separação entre API e banco | Sim | Sim | `servidor/controllers/`, `servidor/services/`, `servidor/repositories/` |
| Justificativa da escolha do banco | Sim | Revisada | `docs/etapa-07.md` |
| Modelo do banco | Sim | Inspecionado | `docs/modelo-banco.png`, `docs/modelo-banco.mmd` |
| Descrição das entidades | Sim | Revisada | `docs/etapa-07.md` |
| Descrição dos relacionamentos | Sim | Testado | `docs/etapa-07.md`, `servidor/database/schema.sql` |
| Instruções de criação do banco | Sim | Sim | `docs/etapa-07.md`, `servidor/database/connection.js` |
| Exemplos de operações CRUD | Sim | Revisados | `docs/etapa-07.md` |
