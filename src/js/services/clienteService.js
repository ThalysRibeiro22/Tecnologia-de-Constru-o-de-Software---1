/*
 * Operações relacionadas aos clientes.
 * Os módulos de tela usam estas funções e não conhecem a URL da API.
 */

import { obter, enviar } from "./api.js";

// GET /api/clientes
export function listarClientes() {
  return obter("/clientes");
}

// POST /api/clientes: devolve o cliente criado (já com o id gerado pelo servidor)
export function cadastrarCliente(dados) {
  return enviar("/clientes", dados);
}
