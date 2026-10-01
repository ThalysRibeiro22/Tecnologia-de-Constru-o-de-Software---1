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

## Tecnologias definidas na arquitetura

* **Cliente:** HTML5, CSS3, JavaScript (com possibilidade de framework CSS leve, como Bootstrap)
* **Servidor:** Java com Spring Boot
* **Persistência:** PostgreSQL

## Estado atual do projeto

Etapa 04: Interatividade com JavaScript, concluída.

* A especificação completa da Etapa 01 está disponível em [`docs/proposta.md`](docs/proposta.md).
* A documentação da Etapa 02 (protótipo estrutural em HTML) está disponível em [`docs/etapa-02.md`](docs/etapa-02.md).
* A documentação da Etapa 03 (interface responsiva com CSS) está disponível em [`docs/etapa-03.md`](docs/etapa-03.md).
* A documentação da Etapa 04 (interatividade com JavaScript) está disponível em [`docs/etapa-04.md`](docs/etapa-04.md).
* As páginas do sistema estão em [`src/`](src), começando por [`src/index.html`](src/index.html).

Funcionalidades interativas implementadas na Etapa 04:

* Busca e filtragem de projetos no Painel, sem recarregar a página;
* Validação por JavaScript e cadastro dinâmico de cliente na lista de clientes;
* Validação por JavaScript e confirmação de cadastro de novo projeto.
