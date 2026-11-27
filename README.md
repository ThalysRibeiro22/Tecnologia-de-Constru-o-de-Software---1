# MadeiraFlow

Sistema de Gerenciamento de Marcenaria

## Descrição

O MadeiraFlow é uma aplicação web voltada para marcenarias de pequeno e médio porte que trabalham com móveis planejados e sob medida. O objetivo é reunir em um único lugar todo o processo de um projeto de marcenaria, desde o pedido do cliente até a entrega final, passando pelo orçamento e pelo acompanhamento da produção.

## Problema

Marcenarias desse porte costumam organizar seus pedidos de forma manual, com anotações em caderno, planilhas soltas e informações trocadas por WhatsApp. Isso facilita a perda de dados sobre medidas e materiais, dificulta saber em que fase de produção um móvel está e gera divergências entre o que foi combinado com o cliente e o que é efetivamente cobrado.

## Objetivo

Desenvolver uma aplicação web que permita cadastrar clientes, registrar projetos de móveis, montar orçamentos e acompanhar o andamento de cada pedido até a entrega, substituindo o controle manual por um fluxo único e consultável.

## Público-alvo

Marcenarias de pequeno e médio porte, marceneiros autônomos e equipes administrativas responsáveis por atendimento, orçamento e controle de pedidos.

## Principais funcionalidades

* Cadastro de clientes
* Cadastro de projetos (pedidos de móveis)
* Elaboração de orçamento
* Cadastro de materiais utilizados no projeto
* Acompanhamento do status do projeto
* Consulta e listagem de projetos

## Tecnologias

* **Cliente:** HTML5, CSS3, JavaScript (com possibilidade de framework CSS leve, como Bootstrap)
* **Servidor:** Node.js com módulos nativos `http`, `fs` e `path`;
* **Banco de dados:** SQLite, por meio do pacote `better-sqlite3`.

## Etapa atual

Etapa 07: persistência e CRUD com SQLite, integrada à API REST da Etapa 06.

* A especificação completa da Etapa 01 está disponível em [`docs/proposta.md`](docs/proposta.md).
* A documentação da Etapa 02 (protótipo estrutural em HTML) está disponível em [`docs/etapa-02.md`](docs/etapa-02.md).
* A documentação da Etapa 03 (interface responsiva com CSS) está disponível em [`docs/etapa-03.md`](docs/etapa-03.md).
* A documentação da Etapa 04 (interatividade com JavaScript) está disponível em [`docs/etapa-04.md`](docs/etapa-04.md).
* A documentação da Etapa 05 (módulos e comunicação assíncrona) está disponível em [`docs/etapa-05.md`](docs/etapa-05.md).
* A documentação da Etapa 06 (API REST, endpoints, validações e testes) está disponível em [`docs/etapa-06.md`](docs/etapa-06.md).
* A documentação da Etapa 07 (SQLite, modelo, relacionamento e testes) está disponível em [`docs/etapa-07.md`](docs/etapa-07.md).
* O modelo entidade-relacionamento está em [`docs/modelo-banco.png`](docs/modelo-banco.png) e [`docs/modelo-banco.mmd`](docs/modelo-banco.mmd).
* As páginas do sistema estão em [`src/`](src), começando por [`src/index.html`](src/index.html).

Funcionalidades das Etapas 05 a 07:

* JavaScript dividido em módulos ES6 (`src/js/main.js`, `services/`, `modules/` e `utils/`), no lugar do arquivo único da Etapa 04;
* API REST com operações GET, GET individual, POST, PUT e DELETE para clientes e projetos;
* Indicadores de carregamento ("Carregando projetos...", "Salvando..."), mensagens de sucesso e mensagens de erro na própria tela, com opção de tentar novamente;
* Dados guardados no servidor local, no lugar do `localStorage`, com migração automática dos cadastros feitos na Etapa 04;
* validações e erros HTTP padronizados, com proteção contra exclusão de clientes associados a projetos;
* banco SQLite persistente, chave estrangeira clientes-projetos, migração de dados da Etapa 06 e repositórios/services separados.

Na Etapa 07, a API passou a ler e gravar no banco SQLite em `servidor/madeiraflow.sqlite`. O esquema é definido em `servidor/database/schema.sql`; as chaves estrangeiras garantem que todo projeto pertença a um cliente existente. O servidor importa os cadastros iniciais automaticamente e, se encontrar o antigo `servidor/dados.json`, migra os dados válidos uma única vez.

## Como executar

Requisitos: Node.js 22 ou superior e npm. A aplicação precisa do servidor local para servir os módulos ES6 e a API. Instale a dependência SQLite e inicie:

```bash
npm install
npm start
```

No Windows, também é possível dar dois cliques em `iniciar.bat`: ele liga o servidor e abre o navegador. A primeira execução cria/atualiza o esquema e preenche o banco com os dados iniciais se ainda não houver uma inicialização registrada. O banco SQLite é um arquivo local; não é necessário configurar um servidor de banco separado.

Depois, acessar [http://localhost:3000](http://localhost:3000). Para rodar os testes de API, banco, migração e persistência: `npm test`. Para restaurar o banco aos dados iniciais (isso apaga os cadastros adicionados): `npm run resetar`. Consulte [`docs/etapa-07.md`](docs/etapa-07.md) para o modelo e os exemplos CRUD, e [`docs/etapa-06.md`](docs/etapa-06.md) para os detalhes das rotas. A coleção Postman importável continua em [`docs/postman/Madeiraflow-Etapa-06.postman_collection.json`](docs/postman/Madeiraflow-Etapa-06.postman_collection.json). O histórico das etapas anteriores permanece documentado nos arquivos correspondentes.
