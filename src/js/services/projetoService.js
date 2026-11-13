/*
 * Operações relacionadas aos projetos.
 * Os módulos de tela usam estas funções e não conhecem a URL da API.
 */

import { obter, enviar } from "./api.js";

// GET /api/projetos
export function listarProjetos() {
  return obter("/projetos");
}

// POST /api/projetos: devolve o projeto criado (com id, nome do cliente e data
// definidos pelo servidor)
export function cadastrarProjeto(dados) {
  return enviar("/projetos", dados);
}
