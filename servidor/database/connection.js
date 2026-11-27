"use strict";

const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const DATABASE_PATH = path.resolve(process.env.DATABASE_PATH || path.join(__dirname, "..", "madeiraflow.sqlite"));
const INITIAL_DATA_PATH = path.join(__dirname, "..", "dados.inicial.json");
const LEGACY_DATA_PATH = process.env.LEGACY_JSON_PATH || path.join(__dirname, "..", "dados.json");

fs.mkdirSync(path.dirname(DATABASE_PATH), { recursive: true });
const db = new Database(DATABASE_PATH, { timeout: 5000 });
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");
db.pragma("journal_mode = WAL");
db.pragma("synchronous = FULL");
db.exec(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));

function normalizarStatus(status) {
  return ["orcamento", "aprovado", "producao", "pronto", "entregue"].includes(status) ? status : "orcamento";
}

function importarArquivo(fonte) {
  const dados = JSON.parse(fs.readFileSync(fonte, "utf8"));
  const inserirCliente = db.prepare(
    "INSERT INTO clientes (id, nome, telefone, email) VALUES (@id, @nome, @telefone, @email) " +
    "ON CONFLICT(id) DO UPDATE SET nome = excluded.nome, telefone = excluded.telefone, email = excluded.email"
  );
  const inserirProjeto = db.prepare(
    "INSERT OR IGNORE INTO projetos (id, titulo, cliente_id, ambiente, descricao, status, data_criacao, link) " +
    "VALUES (@id, @titulo, @cliente_id, @ambiente, @descricao, @status, @data_criacao, @link) " +
    "ON CONFLICT(id) DO UPDATE SET titulo = excluded.titulo, cliente_id = excluded.cliente_id, ambiente = excluded.ambiente, " +
    "descricao = excluded.descricao, status = excluded.status, data_criacao = excluded.data_criacao, link = excluded.link"
  );
  let clientes = 0;
  let projetos = 0;

  (Array.isArray(dados.clientes) ? dados.clientes : []).slice().reverse().forEach((cliente) => {
    const id = typeof cliente.id === "string" ? cliente.id.trim() : "";
    const nome = typeof cliente.nome === "string" ? cliente.nome.trim() : "";
    const telefone = typeof cliente.telefone === "string" ? cliente.telefone.trim() : "";
    if (!id || !nome || !telefone) return;
    const resultado = inserirCliente.run({ id, nome, telefone, email: typeof cliente.email === "string" ? cliente.email.trim() : "" });
    clientes += resultado.changes;
  });

  (Array.isArray(dados.projetos) ? dados.projetos : []).slice().reverse().forEach((projeto) => {
    const id = typeof projeto.id === "string" ? projeto.id.trim() : "";
    const titulo = typeof projeto.titulo === "string" ? projeto.titulo.trim() : "";
    const clienteId = typeof projeto.clienteId === "string" ? projeto.clienteId.trim() : "";
    const descricao = typeof projeto.descricao === "string" ? projeto.descricao.trim() : "";
    if (!id || !titulo || !clienteId || !descricao || !db.prepare("SELECT 1 FROM clientes WHERE id = ?").get(clienteId)) return;
    const resultado = inserirProjeto.run({
      id, titulo, cliente_id: clienteId,
      ambiente: typeof projeto.ambiente === "string" ? projeto.ambiente.trim() : "",
      descricao, status: normalizarStatus(projeto.status),
      data_criacao: typeof projeto.dataCriacao === "string" && projeto.dataCriacao ? projeto.dataCriacao : new Date().toLocaleDateString("pt-BR"),
      link: typeof projeto.link === "string" ? projeto.link.trim() : "",
    });
    projetos += resultado.changes;
  });
  return { fonte, clientes, projetos };
}

function inicializarDados() {
  const carregados = db.prepare("SELECT valor FROM app_meta WHERE chave = 'dados_iniciais_carregados'").get();
  const legadoImportado = db.prepare("SELECT valor FROM app_meta WHERE chave = 'dados_json_importado'").get();
  if (carregados) {
    // Também cobre uma atualização feita por cima de uma pasta da Etapa 06:
    // o SQLite pode já vir com os dados iniciais, enquanto dados.json contém cadastros mais novos.
    if (!legadoImportado && fs.existsSync(LEGACY_DATA_PATH)) {
      const migrarLegado = db.transaction(() => {
        const resultado = importarArquivo(LEGACY_DATA_PATH);
        db.prepare("INSERT INTO app_meta (chave, valor) VALUES ('dados_json_importado', ?)").run(new Date().toISOString());
        return resultado;
      });
      return migrarLegado();
    }
    return null;
  }
  const importar = db.transaction(() => {
    const fonte = fs.existsSync(LEGACY_DATA_PATH) ? LEGACY_DATA_PATH : INITIAL_DATA_PATH;
    const resultado = importarArquivo(fonte);
    db.prepare("INSERT INTO app_meta (chave, valor) VALUES ('dados_iniciais_carregados', ?)").run(new Date().toISOString());
    if (fonte === LEGACY_DATA_PATH) db.prepare("INSERT INTO app_meta (chave, valor) VALUES ('dados_json_importado', ?)").run(new Date().toISOString());
    return resultado;
  });
  return importar();
}

try {
  const importacao = inicializarDados();
  if (importacao) {
    const origem = importacao.fonte === LEGACY_DATA_PATH ? "dados da Etapa 06" : "cadastros iniciais";
    console.log("SQLite: " + importacao.clientes + " clientes e " + importacao.projetos + " projetos importados de " + origem + ".");
  }
} catch (erro) {
  db.close();
  throw erro;
}

module.exports = { db, DATABASE_PATH };
