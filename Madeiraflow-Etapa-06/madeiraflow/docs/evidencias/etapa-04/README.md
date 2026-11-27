# Evidências da Etapa 04

Esta pasta está preparada para receber as capturas de tela que demonstram as funcionalidades de JavaScript em funcionamento. Nenhuma captura foi gerada automaticamente: elas precisam ser feitas manualmente, no navegador, seguindo os passos de "Como testar" em [`docs/etapa-04.md`](../../etapa-04.md).

## Capturas esperadas

| Arquivo sugerido | O que mostrar |
|---|---|
| `evidencia-01-busca-funcionando.png` | `index.html` com um termo digitado no campo "Cliente" e apenas os projetos correspondentes visíveis |
| `evidencia-02-validacao-cliente.png` | `cliente.html` com o formulário enviado vazio (ou com telefone/e-mail inválido) e as mensagens de erro visíveis abaixo dos campos |
| `evidencia-03-cliente-cadastrado.png` | `cliente.html` logo após um cadastro válido, mostrando o novo cliente no topo da lista e a mensagem de sucesso |
| `evidencia-04-validacao-projeto.png` | `novo-projeto.html` com o formulário enviado vazio (ou incompleto) e as mensagens de erro visíveis |
| `evidencia-05-busca-sem-resultado.png` | `index.html` com uma busca que não retorna nenhum projeto, mostrando a mensagem "Não encontramos projetos para essa busca." |
| `evidencia-06-cliente-no-select.png` | `novo-projeto.html` com o campo "Cliente" aberto, mostrando o cliente recém-cadastrado em `cliente.html` já disponível na lista |
| `evidencia-07-projeto-no-painel.png` | `index.html` mostrando o projeto recém-criado em `novo-projeto.html` já aparecendo entre os cards |

## Como capturar

1. Abra a página indicada (`index.html`, `cliente.html` ou `novo-projeto.html`) no navegador.
2. Reproduza a ação descrita na tabela (digitar uma busca, enviar um formulário vazio, cadastrar um cliente, etc.) — o passo a passo completo está em "Como testar" no `docs/etapa-04.md`.
3. Tire a captura de tela da janela do navegador mostrando o resultado.
4. Salve o arquivo com um nome parecido com o sugerido na tabela, dentro desta pasta (`docs/evidencias/etapa-04/`).

O nome exato do arquivo não é obrigatório, mas é importante que cada captura mostre claramente qual das 7 situações da tabela ela representa. As evidências 6 e 7 são as mais importantes desta revisão: mostram que os dados agora passam de uma página para outra (persistência via `localStorage`), que era o problema relatado.
