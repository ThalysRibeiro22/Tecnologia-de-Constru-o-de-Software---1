"use strict";

const { randomUUID } = require("crypto");
const clientes = require("../repositories/clientesRepository");
const ErroAplicacao = require("./erroAplicacao");
const TELEFONE = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function texto(valor) { return typeof valor === "string" ? valor.trim() : ""; }
function validar(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) throw new ErroAplicacao(400, "CORPO_INVALIDO", "O corpo deve ser um objeto JSON.");
  const nome = texto(dados.nome); const telefone = texto(dados.telefone); const email = texto(dados.email);
  const detalhes = [];
  if (!nome) detalhes.push({ campo: "nome", mensagem: "Informe o nome do cliente." });
  if (!telefone) detalhes.push({ campo: "telefone", mensagem: "Informe o telefone do cliente." });
  else if (!TELEFONE.test(telefone)) detalhes.push({ campo: "telefone", mensagem: "Use o formato (00) 00000-0000." });
  if (email && !EMAIL.test(email)) detalhes.push({ campo: "email", mensagem: "Informe um e-mail válido." });
  if (detalhes.length) throw new ErroAplicacao(422, "VALIDACAO_FALHOU", "Os dados do cliente são inválidos.", detalhes);
  return { nome, telefone, email };
}

function listar() { return clientes.listar(); }
function buscar(id) {
  const cliente = clientes.buscar(id);
  if (!cliente) throw new ErroAplicacao(404, "REGISTRO_NAO_ENCONTRADO", "O cliente solicitado não foi encontrado.");
  return cliente;
}
function criar(dados) {
  const cliente = { id: "cliente-" + randomUUID(), ...validar(dados) };
  clientes.criar(cliente);
  return cliente;
}
function atualizar(id, dados) {
  buscar(id);
  const cliente = { id, ...validar(dados) };
  clientes.atualizar(cliente);
  return cliente;
}
function excluir(id) {
  buscar(id);
  if (clientes.possuiProjetos(id)) throw new ErroAplicacao(409, "CLIENTE_VINCULADO", "Não é possível excluir o cliente enquanto houver projetos vinculados. Exclua ou reassocie os projetos primeiro.");
  clientes.excluir(id);
}

module.exports = { listar, buscar, criar, atualizar, excluir, validar };
