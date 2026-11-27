"use strict";

const ErroAplicacao = require("../services/erroAplicacao");
const clientes = require("../services/clientesService");
const projetos = require("../services/projetosService");
const migracao = require("../services/migracaoService");
let falhaSimulada = false;

function responderJson(res, status, corpo, extras) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...(extras || {}) });
  res.end(JSON.stringify(corpo));
}
function sucesso(res, status, dados, mensagem) {
  return responderJson(res, status, { dados, ...(mensagem ? { mensagem } : {}) },
    status === 201 && dados && dados.id ? { Location: "/api/" + (dados.clienteId !== undefined ? "projetos/" : "clientes/") + encodeURIComponent(dados.id) } : undefined);
}
function responderErro(res, erro) {
  if (erro instanceof ErroAplicacao) {
    const extras = erro.status === 405 && erro.allow ? { Allow: erro.allow } : undefined;
    return responderJson(res, erro.status, { erro: { codigo: erro.codigo, mensagem: erro.message, ...(erro.detalhes ? { detalhes: erro.detalhes } : {}) } }, extras);
  }
  if (erro && typeof erro.code === "string" && erro.code.startsWith("SQLITE_BUSY")) {
    console.error("SQLite ocupado ou indisponível:", erro.message);
    return responderJson(res, 503, { erro: { codigo: "BANCO_INDISPONIVEL", mensagem: "O banco de dados está temporariamente ocupado. Tente novamente." } });
  }
  if (erro && typeof erro.code === "string" && erro.code.startsWith("SQLITE_CONSTRAINT")) {
    return responderJson(res, 409, { erro: { codigo: "CONFLITO_DE_DADOS", mensagem: "A operação conflita com as regras de integridade dos dados." } });
  }
  console.error("Falha ao atender a API:", erro);
  return responderJson(res, 500, { erro: { codigo: "ERRO_PERSISTENCIA", mensagem: "Não foi possível concluir a operação no banco de dados." } });
}
function naoPermitido(res, metodos) {
  throw Object.assign(new ErroAplicacao(405, "METODO_NAO_PERMITIDO", "Método HTTP não permitido para este endereço."), { allow: metodos.join(", ") });
}
function esperar(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function lerJson(req) {
  return new Promise((resolve, reject) => {
    const partes = []; let tamanho = 0; let excedeu = false;
    req.on("data", (parte) => {
      tamanho += parte.length;
      if (tamanho > 1000000) { excedeu = true; reject(new ErroAplicacao(413, "CORPO_MUITO_GRANDE", "O corpo da requisição excede 1 MB.")); req.resume(); }
      else partes.push(parte);
    });
    req.on("end", () => {
      if (excedeu) return;
      if (!String(req.headers["content-type"] || "").toLowerCase().includes("application/json")) return reject(new ErroAplicacao(400, "CONTENT_TYPE_INVALIDO", "Envie o corpo com Content-Type: application/json."));
      try {
        const corpo = JSON.parse(Buffer.concat(partes).toString("utf8"));
        if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) throw new Error("Formato inválido");
        resolve(corpo);
      } catch (_) { reject(new ErroAplicacao(400, "JSON_INVALIDO", "O corpo da requisição não contém um objeto JSON válido.")); }
    });
    req.on("error", reject);
  });
}
async function tratarRecurso(req, res, tipo, id) {
  const service = tipo === "clientes" ? clientes : projetos;
  const permitidos = id ? ["GET", "PUT", "DELETE"] : ["GET", "POST"];
  if (!permitidos.includes(req.method)) naoPermitido(res, permitidos);
  if (!id) {
    if (req.method === "GET") return sucesso(res, 200, service.listar());
    const criado = service.criar(await lerJson(req));
    return sucesso(res, 201, criado, "Registro criado com sucesso.");
  }
  if (req.method === "GET") return sucesso(res, 200, service.buscar(id));
  if (req.method === "PUT") return sucesso(res, 200, service.atualizar(id, await lerJson(req)), "Registro atualizado com sucesso.");
  service.excluir(id);
  res.writeHead(204, { "Cache-Control": "no-store" });
  return res.end();
}
function textoSimulacao(res, texto) { res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }); res.end(texto); }

async function tratar(req, res, url) {
  try {
    const caminho = url.pathname;
    if (caminho === "/api/_simulacao/falha" && req.method === "GET") { falhaSimulada = true; return textoSimulacao(res, "API em modo de falha. Acesse /api/_simulacao/normal para reativar."); }
    if (caminho === "/api/_simulacao/normal" && req.method === "GET") { falhaSimulada = false; return textoSimulacao(res, "API funcionando normalmente."); }
    if (caminho === "/api/_simulacao/status" && req.method === "GET") return textoSimulacao(res, falhaSimulada ? "falha" : "normal");
    await esperar(req.apiAtrasoMs || 0);
    if (falhaSimulada) throw new ErroAplicacao(503, "SERVICO_INDISPONIVEL", "Serviço temporariamente indisponível (falha simulada). Tente novamente.");
    const rota = caminho.match(/^\/api\/(clientes|projetos)(?:\/([^/]+))?$/);
    if (rota) {
      let id = null;
      if (rota[2] !== undefined) {
        try { id = decodeURIComponent(rota[2]); }
        catch (_) { throw new ErroAplicacao(400, "ID_INVALIDO", "O ID informado possui codificação inválida."); }
      }
      return await tratarRecurso(req, res, rota[1], id);
    }
    if (caminho === "/api/migracao") {
      if (req.method !== "POST") return naoPermitido(res, ["POST"]);
      return sucesso(res, 200, migracao.importar(await lerJson(req)));
    }
    throw new ErroAplicacao(404, "ROTA_NAO_ENCONTRADA", "A rota da API não foi encontrada.");
  } catch (erro) { return responderErro(res, erro); }
}

module.exports = { tratar };
