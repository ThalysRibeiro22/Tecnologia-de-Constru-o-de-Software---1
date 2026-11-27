"use strict";

const { randomUUID } = require("crypto");
const projetos = require("../repositories/projetosRepository");
const clientes = require("../repositories/clientesRepository");
const ErroAplicacao = require("./erroAplicacao");

const STATUS = { orcamento: "Orçamento", aprovado: "Aprovado", producao: "Em produção", pronto: "Pronto", entregue: "Entregue" };
function texto(valor) { return typeof valor === "string" ? valor.trim() : ""; }
function validar(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) throw new ErroAplicacao(400, "CORPO_INVALIDO", "O corpo deve ser um objeto JSON.");
  const titulo = texto(dados.titulo); const descricao = texto(dados.descricao);
  const clienteId = texto(dados.clienteId); const status = texto(dados.status) || "orcamento";
  const detalhes = [];
  if (!clienteId) detalhes.push({ campo: "clienteId", mensagem: "Selecione um cliente." });
  else if (!clientes.buscar(clienteId)) detalhes.push({ campo: "clienteId", mensagem: "O cliente informado não existe." });
  if (!titulo) detalhes.push({ campo: "titulo", mensagem: "Informe o título do projeto." });
  if (!descricao) detalhes.push({ campo: "descricao", mensagem: "Descreva o projeto para continuar." });
  if (!STATUS[status]) detalhes.push({ campo: "status", mensagem: "Status de projeto inválido." });
  if (detalhes.length) throw new ErroAplicacao(422, "VALIDACAO_FALHOU", "Os dados do projeto são inválidos.", detalhes);
  return { titulo, clienteId, ambiente: texto(dados.ambiente), descricao, status };
}
function dataAtual() { return new Date().toLocaleDateString("pt-BR"); }
function apresentar(projeto) {
  return { ...projeto, statusLabel: STATUS[projeto.status] || "Orçamento" };
}
function listar() { return projetos.listar().map(apresentar); }
function buscar(id) {
  const projeto = projetos.buscar(id);
  if (!projeto) throw new ErroAplicacao(404, "REGISTRO_NAO_ENCONTRADO", "O projeto solicitado não foi encontrado.");
  return apresentar(projeto);
}
function criar(dados) {
  const projeto = { id: "projeto-" + randomUUID(), ...validar(dados), dataCriacao: dataAtual(), link: "" };
  projetos.criar(projeto);
  return buscar(projeto.id);
}
function atualizar(id, dados) {
  const existente = buscar(id);
  const projeto = { id, ...validar(dados), dataCriacao: existente.dataCriacao, link: existente.link };
  projetos.atualizar(projeto);
  return buscar(id);
}
function excluir(id) {
  buscar(id);
  projetos.excluir(id);
}

module.exports = { listar, buscar, criar, atualizar, excluir, validar, STATUS };
