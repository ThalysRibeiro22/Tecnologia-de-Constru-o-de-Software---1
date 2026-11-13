/*
 * MadeiraFlow - ponto de entrada da aplicação (Etapa 05).
 *
 * Todas as páginas com interatividade carregam apenas este arquivo
 * (<script type="module" src="js/main.js">). Ele migra os dados antigos, se
 * houver, e inicia os módulos. Cada módulo confere se os elementos da sua
 * própria página existem; os que não se aplicam à página atual simplesmente
 * não fazem nada.
 *
 * Estrutura:
 *   services/  comunicação com a API (api, clienteService, projetoService, migracaoService)
 *   modules/   telas (painel, clientes, projetos)
 *   utils/     funções reaproveitadas (validacao, interface, storage)
 */

import { migrarDadosLocais } from "./services/migracaoService.js";
import { iniciarPainel } from "./modules/painel.js";
import { iniciarClientes } from "./modules/clientes.js";
import { iniciarFormularioProjeto } from "./modules/projetos.js";

async function iniciarAplicacao() {
  // Primeiro leva para o servidor o que a Etapa 04 deixou no navegador (se houver),
  // para que esses dados já apareçam na primeira consulta.
  await migrarDadosLocais();

  iniciarPainel();
  iniciarClientes();
  iniciarFormularioProjeto();
}

iniciarAplicacao();
