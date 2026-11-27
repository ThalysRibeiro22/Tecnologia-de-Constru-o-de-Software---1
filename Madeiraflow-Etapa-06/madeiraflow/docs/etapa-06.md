# Etapa 06 — API REST do MadeiraFlow

## Objetivo e tecnologias

A etapa evolui o servidor e a persistência da Etapa 05 para expor clientes e projetos por uma API REST funcional. O servidor usa Node.js 16 ou superior e os módulos nativos `http`, `fs` e `path`; a interface usa Fetch API e módulos ES6. Não há dependências externas. Os registros continuam salvos em `servidor/dados.json`, inicializado a partir de `servidor/dados.inicial.json`.

## Formato comum

Todas as respostas JSON bem-sucedidas usam `{ "dados": ..., "mensagem": "..." }` (a mensagem é opcional). Erros usam `{ "erro": { "codigo": "...", "mensagem": "...", "detalhes": [...] } }`; `detalhes` aparece quando há erros de validação. Exclusões respondem `204 No Content`, sem corpo.

URL base padrão: `http://localhost:3000`. Cabeçalho de conteúdo dos corpos: `Content-Type: application/json`. Os IDs são strings opacas geradas pelo servidor; não envie ID no corpo para criação nem tente alterá-lo.

## Endpoints

| Método | Endpoint | Parâmetros/corpo | Sucesso | Erros principais |
|---|---|---|---|---|
| GET | `/api/clientes` | Nenhum | 200, `{ dados: [...] }` | 500, 503 |
| GET | `/api/clientes/:id` | ID no caminho | 200, `{ dados: cliente }` | 404, 503 |
| POST | `/api/clientes` | `nome`, `telefone`, `email` (opcional) | 201, registro criado e cabeçalho `Location` | 400, 413, 422 |
| PUT | `/api/clientes/:id` | ID no caminho; campos do cliente | 200, registro atualizado | 400, 404, 422 |
| DELETE | `/api/clientes/:id` | ID no caminho | 204, sem corpo | 404, 409 |
| GET | `/api/projetos` | Nenhum | 200, `{ dados: [...] }` | 500, 503 |
| GET | `/api/projetos/:id` | ID no caminho | 200, `{ dados: projeto }` | 404, 503 |
| POST | `/api/projetos` | `clienteId`, `titulo`, `descricao`, `ambiente` (opcional), `status` (opcional) | 201, registro criado e `Location` | 400, 413, 422 |
| PUT | `/api/projetos/:id` | ID no caminho; campos do projeto | 200, registro atualizado | 400, 404, 422 |
| DELETE | `/api/projetos/:id` | ID no caminho | 204, sem corpo | 404 |

IDs contêm hífens e podem ser passados diretamente ou codificados como segmento de URL. `PUT` substitui os dados editáveis por completo. Em projetos, `dataCriacao` e `link` são preservados pelo servidor durante a atualização; `clienteNome` e `statusLabel` são recalculados.

## Campos e validações

Clientes exigem `nome` não vazio e `telefone` no formato `(00) 00000-0000` (o espaço depois do DDD é opcional). `email` pode ficar vazio; quando informado, deve ter formato de e-mail válido.

Projetos exigem um `clienteId` existente, `titulo` e `descricao` não vazios. Os status aceitos são `orcamento`, `aprovado`, `producao`, `pronto` e `entregue`; quando omitido, o status inicial é `orcamento`. O servidor determina o nome do cliente e o rótulo do status, mantendo os relacionamentos coerentes. Um cliente com projetos associados não pode ser excluído: a API retorna 409 para evitar referências órfãs.

JSON malformado, tipo de conteúdo inadequado ou objeto com formato incorreto retorna 400. Dados de domínio inválidos retornam 422 com detalhes por campo. IDs/rotas inexistentes retornam 404. Método não suportado retorna 405 e cabeçalho `Allow`. Erros inesperados retornam 500; indisponibilidade simulada retorna 503.

## Exemplos

Listar clientes:

```sh
curl http://localhost:3000/api/clientes
```

Exemplo de resposta:

```json
{
  "dados": [
    { "id": "cliente-123", "nome": "Ana Souza", "telefone": "(11) 99999-1234", "email": "ana@example.com" }
  ]
}
```

Cadastrar cliente:

```sh
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nome":"Ana Souza","telefone":"(11) 99999-1234","email":"ana@example.com"}'
```

Atualizar cliente (substitua o ID):

```sh
curl -X PUT http://localhost:3000/api/clientes/cliente-123 \
  -H "Content-Type: application/json" \
  -d '{"nome":"Ana Souza Lima","telefone":"(11) 99999-4321","email":"ana@example.com"}'
```

Excluir cliente:

```sh
curl -i -X DELETE http://localhost:3000/api/clientes/cliente-123
```

Cadastrar projeto (use o ID de um cliente existente):

```sh
curl -X POST http://localhost:3000/api/projetos \
  -H "Content-Type: application/json" \
  -d '{"clienteId":"cliente-123","titulo":"Armário planejado","ambiente":"Quarto","descricao":"Armário com portas de correr","status":"orcamento"}'
```

Atualizar projeto:

```sh
curl -X PUT http://localhost:3000/api/projetos/projeto-456 \
  -H "Content-Type: application/json" \
  -d '{"clienteId":"cliente-123","titulo":"Armário atualizado","ambiente":"Quarto","descricao":"Armário com portas e gavetas","status":"aprovado"}'
```

Exemplo de erro de validação:

```json
{
  "erro": {
    "codigo": "VALIDACAO_FALHOU",
    "mensagem": "Os dados do cliente são inválidos.",
    "detalhes": [{ "campo": "telefone", "mensagem": "Use o formato (00) 00000-0000." }]
  }
}
```

## Execução e testes

Requisito: Node.js 16 ou superior. Na pasta do projeto:

```sh
npm start
```

Abra `http://localhost:3000` para usar o sistema. Para executar os testes de integração automatizados, em outro terminal rode `npm test`. Eles iniciam o servidor numa porta local temporária, usam um arquivo de dados temporário, exercitam operações e verificações de erro e confirmam persistência após reiniciar o processo. Não alteram os dados de uso normal. Para reiniciar o servidor manualmente com atraso desativado: `npm start -- --atraso=0`; para usar outra porta: `npm start -- --porta=3001`.

Também é possível importar [`postman/Madeiraflow-Etapa-06.postman_collection.json`](postman/Madeiraflow-Etapa-06.postman_collection.json) no Postman. A variável `baseUrl` já aponta para `http://localhost:3000`; `clienteId` e `projetoId` são preenchidos após as criações. A criação de projeto na coleção usa o cliente inicial `marcos-lima` para que possa ser executada mesmo depois do pedido de exclusão do cliente de demonstração.

## Integração com a interface e Etapa 05

O painel, os filtros, os formulários, a migração local e o visual foram mantidos. Os serviços front-end continuam isolando o acesso HTTP e agora também disponibilizam consulta individual, atualização e exclusão para clientes e projetos. As respostas em envelope são desembrulhadas pelo serviço central, então as telas existentes continuam consumindo os registros como antes.

## Auditoria dos requisitos

| Requisito | Implementado? | Testado? | Arquivo relacionado |
|---|---|---|---|
| API REST | Sim | Sim | `servidor/servidor.js` |
| GET de consulta | Sim | Sim | `servidor/servidor.js`, `tests/api.test.js` |
| GET individual | Sim | Sim | `servidor/servidor.js`, `tests/api.test.js` |
| POST de criação | Sim | Sim | `servidor/servidor.js`, `tests/api.test.js` |
| PUT de alteração | Sim | Sim | `servidor/servidor.js`, `tests/api.test.js` |
| DELETE de exclusão | Sim | Sim | `servidor/servidor.js`, `tests/api.test.js` |
| HTTP e JSON | Sim | Sim | `servidor/servidor.js`, `tests/api.test.js` |
| Códigos HTTP coerentes | Sim | Sim | `servidor/servidor.js`, `tests/api.test.js` |
| Validação de entradas | Sim | Sim | `servidor/servidor.js`, `tests/api.test.js` |
| Padronização de erros | Sim | Sim | `servidor/servidor.js`, `src/js/services/api.js` |
| Organização das rotas | Sim | Sim | `servidor/servidor.js` |
| Testes da API | Sim | Sim | `tests/api.test.js` |
| Documentação | Sim | Revisada | `docs/etapa-06.md` |
| Exemplos de requisições | Sim | N/A (documentação) | `docs/etapa-06.md` |
| Exemplos de respostas | Sim | N/A (documentação) | `docs/etapa-06.md` |
| Coleção Postman | Sim | JSON validado | `docs/postman/Madeiraflow-Etapa-06.postman_collection.json` |
| Instruções de execução | Sim | Sim | `README.md`, `docs/etapa-06.md` |
| Persistência após reiniciar | Sim | Sim | `servidor/servidor.js`, `tests/api.test.js` |
