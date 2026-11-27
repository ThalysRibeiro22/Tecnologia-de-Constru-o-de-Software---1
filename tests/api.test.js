"use strict";

// Testes de integração da API e da persistência SQLite: npm test.
const assert = require("assert");
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const Database = require("better-sqlite3");

const raiz = path.join(__dirname, "..");
const pastaTeste = fs.mkdtempSync(path.join(os.tmpdir(), "madeiraflow-etapa07-"));
const arquivoBanco = path.join(pastaTeste, "madeiraflow.sqlite");
const arquivoMigracao = path.join(pastaTeste, "legacy.json");
const caminhoLegacyAusente = path.join(pastaTeste, "sem-dados-legados.json");
let servidor; let base;

function portaLivre() {
  return new Promise((resolve, reject) => {
    const socket = http.createServer(); socket.once("error", reject);
    socket.listen(0, "127.0.0.1", () => { const porta = socket.address().port; socket.close(() => resolve(porta)); });
  });
}
async function iniciar(databasePath, legacyPath) {
  const porta = await portaLivre(); base = "http://127.0.0.1:" + porta;
  servidor = spawn(process.execPath, [path.join(raiz, "servidor", "servidor.js"), "--atraso=0", "--porta=" + porta], {
    cwd: raiz,
    env: { ...process.env, PORT: String(porta), ATRASO_MS: "0", DATABASE_PATH: databasePath, LEGACY_JSON_PATH: legacyPath },
    stdio: "ignore",
  });
  for (let tentativa = 0; tentativa < 100; tentativa++) {
    if (servidor.exitCode !== null) throw new Error("Servidor encerrou durante a inicialização.");
    try { const resposta = await request("GET", "/api/clientes"); if (resposta.status === 200) return; } catch (_) {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("Servidor não iniciou no tempo esperado.");
}
async function parar() {
  const processo = servidor;
  servidor = null;
  if (!processo || processo.exitCode !== null) return;
  await new Promise((resolve) => {
    const limite = setTimeout(resolve, 1000);
    processo.once("exit", () => { clearTimeout(limite); resolve(); });
    processo.kill();
  });
}
function request(metodo, rota, corpo, cabecalhos = {}) {
  return new Promise((resolve, reject) => {
    const headers = { ...cabecalhos };
    let corpoEnviado;
    if (corpo !== undefined && typeof corpo !== "string") {
      corpoEnviado = JSON.stringify(corpo);
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
    } else corpoEnviado = corpo;
    const pedido = http.request(base + rota, { method: metodo, headers }, (resposta) => {
      const partes = [];
      resposta.on("data", (parte) => partes.push(parte));
      resposta.on("end", () => {
        const texto = Buffer.concat(partes).toString("utf8");
        const tipo = String(resposta.headers["content-type"] || "");
        const body = !texto ? null : tipo.includes("application/json") ? JSON.parse(texto) : texto;
        resolve({ status: resposta.statusCode, headers: resposta.headers, body });
      });
    });
    pedido.on("error", reject);
    if (corpoEnviado !== undefined) pedido.write(corpoEnviado);
    pedido.end();
  });
}
function status(resposta, esperado) { assert.strictEqual(resposta.status, esperado, JSON.stringify(resposta.body)); }
function apagarPastaTeste() { fs.rmSync(pastaTeste, { recursive: true, force: true }); }

async function testarCrudPersistenciaEIntegridade() {
  await iniciar(arquivoBanco, caminhoLegacyAusente);
  let resposta = await request("GET", "/api/clientes"); status(resposta, 200);
  assert.strictEqual(resposta.body.dados.length, 3, "clientes iniciais devem continuar disponíveis");
  const clienteExistente = resposta.body.dados[0];
  resposta = await request("GET", "/api/clientes/" + clienteExistente.id); status(resposta, 200);
  resposta = await request("GET", "/api/clientes/ausente"); status(resposta, 404);

  resposta = await request("POST", "/api/clientes", { nome: "Cliente Persistente", telefone: "(11) 99999-1234", email: "persistente@example.com" }); status(resposta, 201);
  const clienteId = resposta.body.dados.id;
  resposta = await request("POST", "/api/clientes", { nome: "Cliente para excluir", telefone: "(11) 99999-5678", email: "" }); status(resposta, 201);
  const clienteTemporarioId = resposta.body.dados.id;
  resposta = await request("POST", "/api/clientes", { nome: "Inválido", telefone: "123" }); status(resposta, 422);
  resposta = await request("POST", "/api/clientes", { nome: "E-mail inválido", telefone: "(11) 99999-1234", email: "email-invalido" }); status(resposta, 422);
  resposta = await request("POST", "/api/clientes", "{", { "Content-Type": "application/json" }); status(resposta, 400);
  resposta = await request("PUT", "/api/clientes/ausente", { nome: "Ausente", telefone: "(11) 99999-0000", email: "" }); status(resposta, 404);
  resposta = await request("PUT", "/api/clientes/" + clienteId, { nome: "Cliente Persistente Atualizado", telefone: "(11) 99999-4321", email: "novo@example.com" }); status(resposta, 200);
  assert.strictEqual(resposta.body.dados.nome, "Cliente Persistente Atualizado");
  resposta = await request("DELETE", "/api/clientes/" + clienteTemporarioId); status(resposta, 204);

  resposta = await request("GET", "/api/projetos"); status(resposta, 200);
  assert.strictEqual(resposta.body.dados.length, 4, "projetos iniciais devem continuar disponíveis");
  const projetoExistente = resposta.body.dados[0];
  resposta = await request("GET", "/api/projetos/" + projetoExistente.id); status(resposta, 200);
  assert(resposta.body.dados.statusLabel, "API deve manter o rótulo de status usado nos cartões do painel");
  resposta = await request("GET", "/api/projetos/ausente"); status(resposta, 404);
  resposta = await request("POST", "/api/projetos", { clienteId, titulo: "Projeto persistente", ambiente: "Sala", descricao: "Criado para testar SQLite", status: "orcamento" }); status(resposta, 201);
  const projetoId = resposta.body.dados.id;
  assert.strictEqual(resposta.body.dados.clienteNome, "Cliente Persistente Atualizado");
  assert.strictEqual(resposta.body.dados.statusLabel, "Orçamento");
  resposta = await request("POST", "/api/projetos", { clienteId: "cliente-inexistente", titulo: "Inválido", descricao: "Sem cliente" }); status(resposta, 422);
  resposta = await request("POST", "/api/projetos", { clienteId, titulo: "Status inválido", descricao: "Status fora da lista", status: "invalido" }); status(resposta, 422);
  resposta = await request("PUT", "/api/projetos/" + projetoId, { clienteId, titulo: "Projeto persistente atualizado", ambiente: "Sala", descricao: "Alteração salva no SQLite", status: "aprovado" }); status(resposta, 200);
  assert.strictEqual(resposta.body.dados.status, "aprovado");
  resposta = await request("DELETE", "/api/clientes/" + clienteId); status(resposta, 409);
  resposta = await request("DELETE", "/api/projetos/ausente"); status(resposta, 404);
  resposta = await request("PATCH", "/api/clientes"); status(resposta, 405);
  assert.strictEqual(resposta.headers.allow, "GET, POST");
  resposta = await request("GET", "/api/rota-inexistente"); status(resposta, 404);

  resposta = await request("POST", "/api/migracao", {
    clientes: [{ id: "cliente-localstorage", nome: "Cliente migrado do navegador", telefone: "(11) 98888-2222", email: "" }],
    projetos: [{ id: "projeto-localstorage", titulo: "Projeto migrado", clienteId: "cliente-localstorage", descricao: "Migração compatível", status: "orcamento" }],
  }); status(resposta, 200);
  assert.deepStrictEqual(resposta.body.dados, { clientesImportados: 1, projetosImportados: 1 });
  resposta = await request("POST", "/api/migracao", { clientes: [{ id: "cliente-localstorage", nome: "Duplicado", telefone: "", email: "" }], projetos: [] }); status(resposta, 200);
  assert.strictEqual(resposta.body.dados.clientesImportados, 0);

  // Mantém um lock de escrita por uma conexão separada para verificar que
  // falhas reais de persistência viram 503 genérico, sem expor o erro SQL.
  const dbLock = new Database(arquivoBanco);
  dbLock.exec("BEGIN EXCLUSIVE");
  try {
    resposta = await request("POST", "/api/clientes", { nome: "Sem gravação", telefone: "(11) 97777-3333", email: "" });
    status(resposta, 503);
    assert.strictEqual(resposta.body.erro.codigo, "BANCO_INDISPONIVEL");
  } finally { dbLock.exec("ROLLBACK"); dbLock.close(); }

  // A restrição relacional também é aplicada pelo próprio SQLite, sem passar pelos serviços.
  const dbCheck = new Database(arquivoBanco);
  dbCheck.pragma("foreign_keys = ON");
  assert.deepStrictEqual(dbCheck.pragma("foreign_key_check"), []);
  assert.strictEqual(dbCheck.prepare("SELECT COUNT(*) AS total FROM projetos WHERE id = ? AND cliente_id = ?").get(projetoId, clienteId).total, 1);
  assert.strictEqual(dbCheck.prepare("SELECT nome FROM clientes WHERE id = ?").get(clienteId).nome, "Cliente Persistente Atualizado");
  assert.strictEqual(dbCheck.prepare("SELECT COUNT(*) AS total FROM projetos WHERE id = 'projeto-localstorage'").get().total, 1);
  assert.throws(() => dbCheck.prepare("INSERT INTO projetos (id,titulo,cliente_id,descricao,data_criacao) VALUES ('fk-invalida','Teste','cliente-que-nao-existe','Teste','01/01/2026')").run(), (erro) => erro.code === "SQLITE_CONSTRAINT_FOREIGNKEY");
  dbCheck.close();
  assert.strictEqual(fs.readFileSync(arquivoBanco).subarray(0, 16).toString("utf8"), "SQLite format 3\u0000");

  await parar(); await iniciar(arquivoBanco, caminhoLegacyAusente);
  resposta = await request("GET", "/api/clientes/" + clienteId); status(resposta, 200);
  assert.strictEqual(resposta.body.dados.nome, "Cliente Persistente Atualizado");
  resposta = await request("GET", "/api/projetos/" + projetoId); status(resposta, 200);
  assert.strictEqual(resposta.body.dados.descricao, "Alteração salva no SQLite");
  assert.strictEqual(resposta.body.dados.clienteId, clienteId);
  resposta = await request("GET", "/api/projetos/projeto-localstorage"); status(resposta, 200);

  // Exclusão do projeto e depois do cliente verifica o caminho feliz do DELETE.
  resposta = await request("DELETE", "/api/projetos/" + projetoId); status(resposta, 204);
  resposta = await request("DELETE", "/api/projetos/projeto-localstorage"); status(resposta, 204);
  resposta = await request("DELETE", "/api/clientes/cliente-localstorage"); status(resposta, 204);
  resposta = await request("DELETE", "/api/clientes/" + clienteId); status(resposta, 204);
  await parar();
}

async function testarMigracaoJsonAntigo() {
  fs.writeFileSync(arquivoMigracao, JSON.stringify({
    clientes: [
      { id: "cliente-legado", nome: "Cliente Legado", telefone: "(21) 98888-7777", email: "legado@example.com" },
      { id: "renata-almeida", nome: "Renata Atualizada no JSON", telefone: "(11) 98765-4321", email: "renata-nova@example.com" },
    ],
    projetos: [
      { id: "projeto-legado", titulo: "Projeto Legado", clienteId: "cliente-legado", clienteNome: "Cliente Legado", ambiente: "Quarto", descricao: "Migrado do JSON antigo", status: "producao", dataCriacao: "10/10/2026", link: "" },
      { id: "projeto-armario-sala", titulo: "Armário Atualizado no JSON", clienteId: "renata-almeida", ambiente: "Sala", descricao: "Edição existente preservada", status: "aprovado", dataCriacao: "12/08/2026", link: "projeto-armario-sala.html" },
    ],
  }), "utf8");
  const arquivoBancoMigracao = path.join(pastaTeste, "migracao.sqlite");
  await iniciar(arquivoBancoMigracao, arquivoMigracao);
  let resposta = await request("GET", "/api/clientes/cliente-legado"); status(resposta, 200);
  resposta = await request("GET", "/api/projetos/projeto-legado"); status(resposta, 200);
  assert.strictEqual(resposta.body.dados.clienteNome, "Cliente Legado");
  resposta = await request("GET", "/api/clientes/renata-almeida"); status(resposta, 200);
  assert.strictEqual(resposta.body.dados.nome, "Renata Atualizada no JSON");
  await parar(); await iniciar(arquivoBancoMigracao, arquivoMigracao);
  resposta = await request("GET", "/api/clientes"); status(resposta, 200);
  assert.strictEqual(resposta.body.dados.filter((cliente) => cliente.id === "cliente-legado").length, 1, "a migração do JSON antigo não deve duplicar dados");
  await parar();

  // Também simula instalar a versão nova por cima de uma pasta que já tem o SQLite
  // inicial e, depois, encontrar o dados.json da Etapa 06 ao lado dele.
  const bancoComSeed = path.join(pastaTeste, "banco-com-seed.sqlite");
  await iniciar(bancoComSeed, caminhoLegacyAusente); await parar();
  await iniciar(bancoComSeed, arquivoMigracao);
  resposta = await request("GET", "/api/clientes"); status(resposta, 200);
  assert.strictEqual(resposta.body.dados.filter((cliente) => cliente.id === "cliente-legado").length, 1);
  assert.strictEqual(resposta.body.dados.length, 4, "a migração tardia soma os registros antigos aos registros iniciais existentes");
  resposta = await request("GET", "/api/clientes/renata-almeida"); status(resposta, 200);
  assert.strictEqual(resposta.body.dados.nome, "Renata Atualizada no JSON", "dados legados atualizados devem prevalecer sobre o seed empacotado");
  resposta = await request("GET", "/api/projetos/projeto-armario-sala"); status(resposta, 200);
  assert.strictEqual(resposta.body.dados.titulo, "Armário Atualizado no JSON");
  await parar(); await iniciar(bancoComSeed, arquivoMigracao);
  resposta = await request("GET", "/api/clientes"); status(resposta, 200);
  assert.strictEqual(resposta.body.dados.filter((cliente) => cliente.id === "cliente-legado").length, 1, "a migração tardia também é executada uma só vez");
  resposta = await request("GET", "/api/clientes/renata-almeida"); status(resposta, 200);
  assert.strictEqual(resposta.body.dados.nome, "Renata Atualizada no JSON");
  await parar();
}

async function testarBancoEntregueEInterface() {
  const bancoInicialDoProjeto = path.join(raiz, "servidor", "madeiraflow.sqlite");
  assert(fs.existsSync(bancoInicialDoProjeto), "o pacote deve conter o arquivo SQLite inicial");
  const copia = path.join(pastaTeste, "banco-entregue.sqlite");
  fs.copyFileSync(bancoInicialDoProjeto, copia);
  await iniciar(copia, caminhoLegacyAusente);
  let resposta = await request("GET", "/api/clientes"); status(resposta, 200);
  assert.strictEqual(resposta.body.dados.length, 3);
  resposta = await request("GET", "/api/projetos"); status(resposta, 200);
  assert.strictEqual(resposta.body.dados.length, 4);
  resposta = await request("GET", "/"); status(resposta, 200);
  assert(resposta.body.includes("<!DOCTYPE html>") || resposta.body.includes("<html"), "a página existente deve continuar sendo servida");
  await parar();
}

(async () => {
  try {
    await testarBancoEntregueEInterface();
    await testarCrudPersistenciaEIntegridade();
    await testarMigracaoJsonAntigo();
    console.log("OK: CRUD no SQLite, interface servida, validações, FK, erros HTTP/banco ocupado, migração JSON/localStorage e persistência após reinício.");
  } catch (erro) {
    console.error(erro); process.exitCode = 1;
  } finally {
    await parar();
    apagarPastaTeste();
  }
})();
