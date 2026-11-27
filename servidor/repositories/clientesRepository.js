"use strict";

const { db } = require("../database/connection");

const selecionarTodos = db.prepare("SELECT id, nome, telefone, email FROM clientes ORDER BY rowid DESC");
const selecionarPorId = db.prepare("SELECT id, nome, telefone, email FROM clientes WHERE id = ?");
const inserir = db.prepare("INSERT INTO clientes (id, nome, telefone, email) VALUES (@id, @nome, @telefone, @email)");
const inserirImportado = db.prepare("INSERT OR IGNORE INTO clientes (id, nome, telefone, email) VALUES (@id, @nome, @telefone, @email)");
const atualizar = db.prepare("UPDATE clientes SET nome = @nome, telefone = @telefone, email = @email WHERE id = @id");
const remover = db.prepare("DELETE FROM clientes WHERE id = ?");
const existeProjeto = db.prepare("SELECT 1 FROM projetos WHERE cliente_id = ? LIMIT 1");

module.exports = {
  listar: () => selecionarTodos.all(),
  buscar: (id) => selecionarPorId.get(id),
  criar: (cliente) => inserir.run(cliente),
  importar: (cliente) => inserirImportado.run(cliente),
  atualizar: (cliente) => atualizar.run(cliente),
  excluir: (id) => remover.run(id),
  possuiProjetos: (id) => Boolean(existeProjeto.get(id)),
};
