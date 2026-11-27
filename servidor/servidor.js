/* MadeiraFlow - Etapa 07: servidor HTTP integrado ao banco SQLite. */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const apiController = require("./controllers/apiController");
const { DATABASE_PATH } = require("./database/connection");

function argumento(nome) {
  const prefixo = "--" + nome + "=";
  const item = process.argv.find((valor) => valor.startsWith(prefixo));
  return item ? item.slice(prefixo.length) : undefined;
}
function numero(valor, padrao) {
  const convertido = Number(valor);
  return valor !== undefined && valor !== "" && Number.isFinite(convertido) && convertido >= 0 ? convertido : padrao;
}

const PORTA = numero(argumento("porta") || process.env.PORT, 3000);
const ATRASO_MS = numero(argumento("atraso") || process.env.ATRASO_MS, 800);
const PASTA_ESTATICA = path.join(__dirname, "..", "src");
const TIPOS = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon",
};

function servirArquivo(req, res, caminho) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Método não permitido.");
  }
  let relativo;
  try { relativo = decodeURIComponent(caminho); }
  catch (_) { res.writeHead(400); return res.end("Endereço inválido."); }
  if (relativo.endsWith("/")) relativo += "index.html";
  const arquivo = path.normalize(path.join(PASTA_ESTATICA, relativo));
  if (arquivo !== PASTA_ESTATICA && !arquivo.startsWith(PASTA_ESTATICA + path.sep)) {
    res.writeHead(403); return res.end("Acesso negado.");
  }
  fs.stat(arquivo, (erro, info) => {
    if (erro || !info.isFile()) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("Arquivo não encontrado."); }
    res.writeHead(200, {
      "Content-Type": TIPOS[path.extname(arquivo).toLowerCase()] || "application/octet-stream",
      "Content-Length": info.size,
      "Cache-Control": "no-cache",
    });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(arquivo).pipe(res);
  });
}

const servidor = http.createServer(async (req, res) => {
  const inicio = Date.now();
  res.on("finish", () => console.log(req.method + " " + req.url + " -> " + res.statusCode + " (" + (Date.now() - inicio) + "ms)"));
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname.startsWith("/api/")) {
      req.apiAtrasoMs = ATRASO_MS;
      await apiController.tratar(req, res, url);
    } else servirArquivo(req, res, url.pathname);
  } catch (erro) {
    console.error("Falha interna do servidor:", erro);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ erro: { codigo: "ERRO_INTERNO", mensagem: "Erro interno do servidor." } }));
    }
  }
});

servidor.on("error", (erro) => {
  if (erro.code === "EADDRINUSE") console.error("A porta " + PORTA + " já está em uso. Use npm start -- --porta=3001.");
  else console.error(erro);
  process.exit(1);
});
servidor.listen(PORTA, () => {
  console.log("MadeiraFlow rodando em http://localhost:" + PORTA);
  console.log("Banco SQLite: " + DATABASE_PATH);
  console.log("Atraso das respostas da API: " + ATRASO_MS + "ms (use --atraso=0 para desativar).");
});
