"use strict";

const { db } = require("../database/connection");
const clientes = require("../repositories/clientesRepository");
const projetos = require("../repositories/projetosRepository");
const { STATUS } = require("./projetosService");

function texto(valor) { return typeof valor === "string" ? valor.trim() : ""; }
function importar(dados) {
  const importarTudo = db.transaction(() => {
    let clientesImportados = 0;
    let projetosImportados = 0;
    (Array.isArray(dados.clientes) ? dados.clientes : []).slice().reverse().forEach((cliente) => {
      const id = texto(cliente && cliente.id); const nome = texto(cliente && cliente.nome);
      if (!id || !nome) return;
      const resultado = clientes.importar({ id, nome, telefone: texto(cliente.telefone), email: texto(cliente.email) });
      clientesImportados += resultado.changes;
    });
    (Array.isArray(dados.projetos) ? dados.projetos : []).slice().reverse().forEach((projeto) => {
      const id = texto(projeto && projeto.id); const titulo = texto(projeto && projeto.titulo);
      const clienteId = texto(projeto && projeto.clienteId); const descricao = texto(projeto && projeto.descricao);
      if (!id || !titulo || !clienteId || !clientes.buscar(clienteId) || !descricao) return;
      const resultado = projetos.importar({
        id, titulo, clienteId, ambiente: texto(projeto.ambiente), descricao,
        status: STATUS[texto(projeto.status)] ? texto(projeto.status) : "orcamento",
        dataCriacao: texto(projeto.dataCriacao) || new Date().toLocaleDateString("pt-BR"),
        link: texto(projeto.link),
      });
      projetosImportados += resultado.changes;
    });
    return { clientesImportados, projetosImportados };
  });
  return importarTudo();
}

module.exports = { importar };
