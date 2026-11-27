"use strict";

const { db } = require("../database/connection");
const colunas = "p.id, p.titulo, p.cliente_id AS clienteId, c.nome AS clienteNome, p.ambiente, p.descricao, p.status, p.data_criacao AS dataCriacao, p.link";
const selecionarTodos = db.prepare("SELECT " + colunas + " FROM projetos p JOIN clientes c ON c.id = p.cliente_id ORDER BY p.rowid DESC");
const selecionarPorId = db.prepare("SELECT " + colunas + " FROM projetos p JOIN clientes c ON c.id = p.cliente_id WHERE p.id = ?");
const inserir = db.prepare("INSERT INTO projetos (id, titulo, cliente_id, ambiente, descricao, status, data_criacao, link) VALUES (@id, @titulo, @clienteId, @ambiente, @descricao, @status, @dataCriacao, @link)");
const atualizar = db.prepare("UPDATE projetos SET titulo = @titulo, cliente_id = @clienteId, ambiente = @ambiente, descricao = @descricao, status = @status WHERE id = @id");
const remover = db.prepare("DELETE FROM projetos WHERE id = ?");
const inserirImportado = db.prepare("INSERT OR IGNORE INTO projetos (id, titulo, cliente_id, ambiente, descricao, status, data_criacao, link) VALUES (@id, @titulo, @clienteId, @ambiente, @descricao, @status, @dataCriacao, @link)");

module.exports = {
  listar: () => selecionarTodos.all(),
  buscar: (id) => selecionarPorId.get(id),
  criar: (projeto) => inserir.run(projeto),
  atualizar: (projeto) => atualizar.run(projeto),
  excluir: (id) => remover.run(id),
  importar: (projeto) => inserirImportado.run(projeto),
};
