/*
 * Operações relacionadas aos clientes.
 * Os módulos de tela usam estas funções e não conhecem a URL da API.
 */

import { obter, enviar, atualizar, excluir } from "./api.js";

// GET /api/clientes
export function listarClientes() {
  return obter("/clientes");
}

// POST /api/clientes: devolve o cliente criado (já com o id gerado pelo servidor)
export function cadastrarCliente(dados) {
  return enviar("/clientes", dados);
}

// GET /api/clientes/:id
export function obterCliente(id) {
  return obter("/clientes/" + encodeURIComponent(id));
}

// PUT /api/clientes/:id
export function atualizarCliente(id, dados) {
  return atualizar("/clientes/" + encodeURIComponent(id), dados);
}

// DELETE /api/clientes/:id
export function excluirCliente(id) {
  return excluir("/clientes/" + encodeURIComponent(id));
}
