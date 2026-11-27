"use strict";

// Teste de integração sem bibliotecas externas: npm test.
const assert = require("assert");
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");

const raiz = path.join(__dirname, "..");
const dadosTeste = path.join(os.tmpdir(), "madeiraflow-api-" + process.pid + ".json");
let servidor; let base;

function portaLivre() {
  return new Promise((resolve, reject) => {
    const s = http.createServer();
    s.once("error", reject);
    s.listen(0, "127.0.0.1", () => { const port = s.address().port; s.close(() => resolve(port)); });
  });
}
async function iniciar() {
  const port = await portaLivre(); base = "http://127.0.0.1:" + port;
  servidor = spawn(process.execPath, [path.join(raiz, "servidor", "servidor.js"), "--atraso=0", "--porta=" + port], {
    cwd: raiz, env: { ...process.env, PORT: String(port), ATRASO_MS: "0", ARQUIVO_DADOS: dadosTeste }, stdio: "ignore",
  });
  for (let i = 0; i < 80; i++) {
    if (servidor.exitCode !== null) throw new Error("Servidor encerrou durante a inicialização.");
    try { const r = await rawCall("GET", "/api/clientes"); if (r.status === 200) return; } catch (_) {}
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error("Servidor não iniciou no tempo esperado.");
}
async function parar() {
  if (!servidor || servidor.exitCode !== null) return;
  await new Promise((resolve) => { servidor.once("exit", resolve); servidor.kill(); setTimeout(resolve, 1000).unref(); });
}
async function chamada(metodo, rota, corpo) {
  const resposta = await rawCall(metodo, rota, corpo === undefined ? undefined : JSON.stringify(corpo), corpo === undefined ? {} : { "Content-Type": "application/json" });
  return { status: resposta.status, cabecalhos: resposta.headers, corpo: resposta.texto ? JSON.parse(resposta.texto) : null };
}
function rawCall(metodo, rota, corpo, cabecalhos = {}) {
  return new Promise((resolve, reject) => {
    const pedido = http.request(base + rota, { method: metodo, headers: cabecalhos }, (resposta) => {
      const partes = [];
      resposta.on("data", (parte) => partes.push(parte));
      resposta.on("end", () => resolve({ status: resposta.statusCode, headers: resposta.headers, texto: Buffer.concat(partes).toString("utf8") }));
    });
    pedido.on("error", reject);
    if (corpo !== undefined) pedido.write(corpo);
    pedido.end();
  });
}
function validarStatus(resultado, esperado) { assert.strictEqual(resultado.status, esperado, JSON.stringify(resultado.corpo)); }

(async () => {
  try {
    await iniciar();
    let r = await chamada("GET", "/api/clientes"); validarStatus(r, 200); assert(Array.isArray(r.corpo.dados));
    const clienteOriginal = r.corpo.dados[0];
    r = await chamada("GET", "/api/clientes/" + clienteOriginal.id); validarStatus(r, 200); assert.strictEqual(r.corpo.dados.id, clienteOriginal.id);
    r = await chamada("GET", "/api/clientes/ausente"); validarStatus(r, 404);
    r = await chamada("POST", "/api/clientes", { nome: "Cliente API Teste", telefone: "(11) 99999-1234", email: "teste@example.com" }); validarStatus(r, 201); assert(r.corpo.dados.id); const clienteId = r.corpo.dados.id;
    r = await chamada("POST", "/api/clientes", { nome: "Inválido", telefone: "123" }); validarStatus(r, 422);
    r = await chamada("PUT", "/api/clientes/ausente", { nome: "Ausente", telefone: "(11) 99999-0000", email: "" }); validarStatus(r, 404);
    r = await chamada("PUT", "/api/clientes/" + clienteId, { nome: "Cliente API Alterado", telefone: "(11) 99999-4321", email: "novo@example.com" }); validarStatus(r, 200); assert.strictEqual(r.corpo.dados.nome, "Cliente API Alterado");
    r = await chamada("DELETE", "/api/clientes/" + clienteId); validarStatus(r, 204);
    r = await chamada("GET", "/api/projetos"); validarStatus(r, 200); assert(r.corpo.dados.length > 0); const projetoOriginal = r.corpo.dados[0];
    r = await chamada("GET", "/api/projetos/" + projetoOriginal.id); validarStatus(r, 200);
    r = await chamada("GET", "/api/projetos/ausente"); validarStatus(r, 404);
    r = await chamada("POST", "/api/projetos", { clienteId: clienteOriginal.id, titulo: "Projeto API Teste", ambiente: "Sala", descricao: "Projeto criado no teste", status: "orcamento" }); validarStatus(r, 201); const projetoId = r.corpo.dados.id;
    r = await chamada("POST", "/api/projetos", { clienteId: "cliente-inexistente", titulo: "Inválido", descricao: "x" }); validarStatus(r, 422);
    r = await chamada("PUT", "/api/projetos/" + projetoId, { clienteId: clienteOriginal.id, titulo: "Projeto API Alterado", ambiente: "Sala", descricao: "Atualizado", status: "aprovado" }); validarStatus(r, 200); assert.strictEqual(r.corpo.dados.status, "aprovado");
    // A proteção contra órfãos impede remover um cliente que possui projetos.
    r = await chamada("DELETE", "/api/clientes/" + clienteOriginal.id); validarStatus(r, 409);
    r = await chamada("DELETE", "/api/projetos/" + projetoId); validarStatus(r, 204);
    r = await chamada("DELETE", "/api/projetos/ausente"); validarStatus(r, 404);
    r = await chamada("GET", "/api/nao-existe"); validarStatus(r, 404);
    r = await chamada("PATCH", "/api/clientes"); validarStatus(r, 405); assert.strictEqual(r.cabecalhos.allow, "GET, POST");
    r = await chamada("POST", "/api/clientes", { nome: "Sem telefone" }); validarStatus(r, 422);
    r = await rawCall("POST", "/api/clientes", "{", { "Content-Type": "application/json" }); validarStatus({ status: r.status }, 400);
    await parar(); await iniciar();
    r = await chamada("GET", "/api/clientes/" + clienteOriginal.id); validarStatus(r, 200);
    r = await chamada("GET", "/api/projetos/" + projetoOriginal.id); validarStatus(r, 200);
    assert(fs.existsSync(dadosTeste), "Arquivo persistido deve existir após reiniciar.");
    console.log("OK: CRUD de clientes e projetos, validações, erros HTTP, integridade e persistência após reinício.");
  } catch (e) { console.error(e); process.exitCode = 1; }
  finally { await parar(); try { fs.rmSync(dadosTeste, { force: true }); } catch (_) {} }
})();
