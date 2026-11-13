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

## Tecnologias planejadas

* **Cliente:** HTML5, CSS3, JavaScript (com possibilidade de framework CSS leve, como Bootstrap)
* **Servidor:** Java com Spring Boot
* **Persistência:** PostgreSQL

## Etapa atual

Etapa 05: Modularização e Comunicação Assíncrona, concluída.

* A especificação completa da Etapa 01 está disponível em [`docs/proposta.md`](docs/proposta.md).
* A documentação da Etapa 02 (protótipo estrutural em HTML) está disponível em [`docs/etapa-02.md`](docs/etapa-02.md).
* A documentação da Etapa 03 (interface responsiva com CSS) está disponível em [`docs/etapa-03.md`](docs/etapa-03.md).
* A documentação da Etapa 04 (interatividade com JavaScript) está disponível em [`docs/etapa-04.md`](docs/etapa-04.md).
* A documentação da Etapa 05 (módulos e comunicação assíncrona) está disponível em [`docs/etapa-05.md`](docs/etapa-05.md).
* As páginas do sistema estão em [`src/`](src), começando por [`src/index.html`](src/index.html).

Funcionalidades adicionadas na Etapa 05:

* JavaScript dividido em módulos ES6 (`src/js/main.js`, `services/`, `modules/` e `utils/`), no lugar do arquivo único da Etapa 04;
* Consulta (GET) de clientes e projetos e envio (POST) de novos clientes e projetos a uma API simulada, usando Fetch API e `async/await`;
* Indicadores de carregamento ("Carregando projetos...", "Salvando..."), mensagens de sucesso e mensagens de erro na própria tela, com opção de tentar novamente;
* Dados guardados no servidor local, no lugar do `localStorage`, com migração automática dos cadastros feitos na Etapa 04.

## Como executar

O projeto precisa do servidor local incluído (Node.js 16 ou superior), porque módulos ES6 não funcionam abrindo o HTML diretamente e porque ele também simula a API. Não há dependências para instalar.

```bash
npm start
```

No Windows, também é possível dar dois cliques em `iniciar.bat` (não usa o npm, só o Node.js): ele liga o servidor e abre o navegador. O arquivo `resetar-dados.bat` restaura os dados iniciais.

Depois, acessar [http://localhost:3000](http://localhost:3000). Para restaurar os dados iniciais: `npm run resetar`. Os detalhes (endpoints, como simular falhas e como testar os estados de carregamento) estão em [`docs/etapa-05.md`](docs/etapa-05.md).
