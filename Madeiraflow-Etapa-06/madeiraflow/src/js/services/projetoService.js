/*
 * Operações relacionadas aos projetos.
 * Os módulos de tela usam estas funções e não conhecem a URL da API.
 */

import { obter, enviar, atualizar, excluir } from "./api.js";

// GET /api/projetos
export function listarProjetos() {
  return obter("/projetos");
}

// POST /api/projetos: devolve o projeto criado (com id, nome do cliente e data
// definidos pelo servidor)
export function cadastrarProjeto(dados) {
  return enviar("/projetos", dados);
}

// GET /api/projetos/:id
export function obterProjeto(id) {
  return obter("/projetos/" + encodeURIComponent(id));
}

// PUT /api/projetos/:id
export function atualizarProjeto(id, dados) {
  return atualizar("/projetos/" + encodeURIComponent(id), dados);
}

// DELETE /api/projetos/:id
export function excluirProjeto(id) {
  return excluir("/projetos/" + encodeURIComponent(id));
}
