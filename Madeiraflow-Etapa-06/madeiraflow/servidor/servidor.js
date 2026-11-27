/* MadeiraFlow - Etapa 06: API REST e servidor de arquivos, sem dependências. */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

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
const ARQUIVO_INICIAL = path.join(__dirname, "dados.inicial.json");
const ARQUIVO_DADOS = process.env.ARQUIVO_DADOS || path.join(__dirname, "dados.json");
const TELEFONE = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATUS = { orcamento: "Orçamento", aprovado: "Aprovado", producao: "Em produção", pronto: "Pronto", entregue: "Entregue" };
const TIPOS = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
let modoFalha = false;

function restaurarDadosIniciais() { fs.copyFileSync(ARQUIVO_INICIAL, ARQUIVO_DADOS); }
function carregarDados() {
  if (!fs.existsSync(ARQUIVO_DADOS)) restaurarDadosIniciais();
  const dados = JSON.parse(fs.readFileSync(ARQUIVO_DADOS, "utf8"));
  dados.clientes = Array.isArray(dados.clientes) ? dados.clientes : [];
  dados.projetos = Array.isArray(dados.projetos) ? dados.projetos : [];
  return dados;
}
function salvarDados(dados) {
  const temporario = ARQUIVO_DADOS + ".tmp";
  fs.writeFileSync(temporario, JSON.stringify(dados, null, 2), "utf8");
  fs.renameSync(temporario, ARQUIVO_DADOS);
}
class ErroHttp extends Error {
  constructor(status, codigo, mensagem, detalhes, permitir) {
    super(mensagem); this.status = status; this.codigo = codigo; this.detalhes = detalhes;
    if (permitir) this.permitir = permitir;
  }
}
function sucesso(res, status, dados, mensagem) {
  const cabecalhos = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
  if (status === 201 && dados && dados.id) cabecalhos.Location = "/api/" + (dados.clienteId !== undefined ? "projetos/" : "clientes/") + encodeURIComponent(dados.id);
  res.writeHead(status, cabecalhos); res.end(JSON.stringify({ dados, ...(mensagem ? { mensagem } : {}) }));
}
function erro(res, status, codigo, mensagem, detalhes) {
  const cabecalhos = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
  if (status === 405) cabecalhos.Allow = detalhes;
  res.writeHead(status, cabecalhos);
  res.end(JSON.stringify({ erro: { codigo, mensagem, ...(Array.isArray(detalhes) ? { detalhes } : {}) } }));
}
function esperar(ms) { return new Promise((resolver) => setTimeout(resolver, ms)); }
function gerarId(prefixo, itens) {
  let id;
  do { id = prefixo + "-" + Date.now() + "-" + Math.floor(Math.random() * 1000000); }
  while (itens.some((item) => item.id === id));
  return id;
}
function dataAtual() {
  const d = new Date(); return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
}
function texto(valor) { return typeof valor === "string" ? valor.trim() : ""; }
function validarObjeto(corpo) {
  if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) throw new ErroHttp(400, "CORPO_INVALIDO", "O corpo deve ser um objeto JSON.");
}
function lerCorpoJson(req) {
  return new Promise((resolve, reject) => {
    const partes = []; let tamanho = 0; let excedeu = false;
    req.on("data", (parte) => {
      tamanho += parte.length;
      if (tamanho > 1000000) { excedeu = true; reject(new ErroHttp(413, "CORPO_MUITO_GRANDE", "O corpo da requisição excede 1 MB.")); req.resume(); }
      else partes.push(parte);
    });
    req.on("end", () => {
      if (excedeu) return;
      if (!String(req.headers["content-type"] || "").toLowerCase().includes("application/json")) return reject(new ErroHttp(400, "CONTENT_TYPE_INVALIDO", "Envie o corpo com Content-Type: application/json."));
      try { const corpo = JSON.parse(Buffer.concat(partes).toString("utf8")); validarObjeto(corpo); resolve(corpo); }
      catch (e) { reject(e instanceof ErroHttp ? e : new ErroHttp(400, "JSON_INVALIDO", "O corpo da requisição não contém JSON válido.")); }
    });
    req.on("error", reject);
  });
}
function validarCliente(corpo) {
  const problemas = []; const nome = texto(corpo.nome); const telefone = texto(corpo.telefone); const email = texto(corpo.email);
  if (!nome) problemas.push({ campo: "nome", mensagem: "Informe o nome do cliente." });
  if (!telefone) problemas.push({ campo: "telefone", mensagem: "Informe o telefone do cliente." });
  else if (!TELEFONE.test(telefone)) problemas.push({ campo: "telefone", mensagem: "Use o formato (00) 00000-0000." });
  if (email && !EMAIL.test(email)) problemas.push({ campo: "email", mensagem: "Informe um e-mail válido." });
  if (problemas.length) throw new ErroHttp(422, "VALIDACAO_FALHOU", "Os dados do cliente são inválidos.", problemas);
  return { nome, telefone, email };
}
function validarProjeto(corpo, dados) {
  const problemas = []; const titulo = texto(corpo.titulo); const descricao = texto(corpo.descricao);
  const clienteId = texto(corpo.clienteId); const status = texto(corpo.status) || "orcamento";
  if (!clienteId) problemas.push({ campo: "clienteId", mensagem: "Selecione um cliente." });
  else if (!dados.clientes.some((item) => item.id === clienteId)) problemas.push({ campo: "clienteId", mensagem: "O cliente informado não existe." });
  if (!titulo) problemas.push({ campo: "titulo", mensagem: "Informe o título do projeto." });
  if (!descricao) problemas.push({ campo: "descricao", mensagem: "Descreva o projeto para continuar." });
  if (!STATUS[status]) problemas.push({ campo: "status", mensagem: "Status de projeto inválido." });
  if (problemas.length) throw new ErroHttp(422, "VALIDACAO_FALHOU", "Os dados do projeto são inválidos.", problemas);
  const cliente = dados.clientes.find((item) => item.id === clienteId);
  return { titulo, clienteId, clienteNome: cliente.nome, ambiente: texto(corpo.ambiente), descricao, status, statusLabel: STATUS[status] };
}
function importarDados(corpo, dados) {
  let clientesImportados = 0; let projetosImportados = 0;
  (Array.isArray(corpo.clientes) ? corpo.clientes : []).forEach((c) => {
    const id = texto(c && c.id); if (!id || !texto(c.nome) || dados.clientes.some((item) => item.id === id)) return;
    dados.clientes.push({ id, nome: texto(c.nome), telefone: texto(c.telefone), email: texto(c.email) }); clientesImportados++;
  });
  (Array.isArray(corpo.projetos) ? corpo.projetos : []).forEach((p) => {
    const id = texto(p && p.id); if (!id || !texto(p.titulo) || dados.projetos.some((item) => item.id === id)) return;
    dados.projetos.push({ id, titulo: texto(p.titulo), clienteId: texto(p.clienteId), clienteNome: texto(p.clienteNome), ambiente: texto(p.ambiente), descricao: texto(p.descricao), status: texto(p.status) || "orcamento", statusLabel: texto(p.statusLabel) || "Orçamento", dataCriacao: texto(p.dataCriacao) || dataAtual(), link: texto(p.link) }); projetosImportados++;
  });
  return { clientesImportados, projetosImportados };
}
function naoPermitido(permitidos) { throw new ErroHttp(405, "METODO_NAO_PERMITIDO", "Método HTTP não permitido para este endereço.", permitidos.join(", ")); }
async function recurso(req, res, dados, tipo, id) {
  const itens = tipo === "clientes" ? dados.clientes : dados.projetos;
  const singular = tipo === "clientes" ? "cliente" : "projeto";
  const permitidos = id ? ["GET", "PUT", "DELETE"] : ["GET", "POST"];
  if (!permitidos.includes(req.method)) naoPermitido(permitidos);
  if (id) {
    const indice = itens.findIndex((item) => item.id === id);
    if (indice < 0) throw new ErroHttp(404, "REGISTRO_NAO_ENCONTRADO", "O " + singular + " solicitado não foi encontrado.");
    if (req.method === "GET") return sucesso(res, 200, itens[indice]);
    if (req.method === "PUT") {
      const corpo = await lerCorpoJson(req);
      const atualizado = tipo === "clientes" ? { id, ...validarCliente(corpo) } : { ...itens[indice], ...validarProjeto(corpo, dados), id };
      itens[indice] = atualizado; salvarDados(dados); return sucesso(res, 200, atualizado, "Registro atualizado com sucesso.");
    }
    if (tipo === "clientes" && dados.projetos.some((p) => p.clienteId === id)) {
      throw new ErroHttp(409, "CLIENTE_VINCULADO", "Não é possível excluir o cliente enquanto houver projetos vinculados. Exclua ou reassocie os projetos primeiro.");
    }
    itens.splice(indice, 1); salvarDados(dados); res.writeHead(204, { "Cache-Control": "no-store" }); return res.end();
  }
  if (req.method === "GET") return sucesso(res, 200, itens);
  const corpo = await lerCorpoJson(req);
  const novo = tipo === "clientes"
    ? { id: gerarId("cliente", itens), ...validarCliente(corpo) }
    : { id: gerarId("projeto", itens), ...validarProjeto(corpo, dados), dataCriacao: dataAtual(), link: "" };
  itens.unshift(novo); salvarDados(dados); return sucesso(res, 201, novo, "Registro criado com sucesso.");
}
async function tratarApi(req, res, url) {
  const caminho = url.pathname;
  if (caminho === "/api/_simulacao/falha" && req.method === "GET") { modoFalha = true; res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("API em modo de falha. Acesse /api/_simulacao/normal para reativar."); }
  if (caminho === "/api/_simulacao/normal" && req.method === "GET") { modoFalha = false; res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("API funcionando normalmente."); }
  if (caminho === "/api/_simulacao/status" && req.method === "GET") { res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }); return res.end(modoFalha ? "falha" : "normal"); }
  await esperar(ATRASO_MS);
  if (modoFalha) throw new ErroHttp(503, "SERVICO_INDISPONIVEL", "Serviço temporariamente indisponível (falha simulada). Tente novamente.");
  const dados = carregarDados();
  if (caminho === "/api/clientes" || caminho === "/api/projetos") return recurso(req, res, dados, caminho.slice(5), null);
  const detalhe = caminho.match(/^\/api\/(clientes|projetos)\/([^/]+)$/);
  if (detalhe) {
    let id; try { id = decodeURIComponent(detalhe[2]); } catch (_) { throw new ErroHttp(400, "ID_INVALIDO", "O ID informado possui codificação inválida."); }
    return recurso(req, res, dados, detalhe[1], id);
  }
  if (caminho === "/api/migracao") {
    if (req.method !== "POST") naoPermitido(["POST"]);
    const resultado = importarDados(await lerCorpoJson(req), dados); salvarDados(dados); return sucesso(res, 200, resultado);
  }
  throw new ErroHttp(404, "ROTA_NAO_ENCONTRADA", "A rota da API não foi encontrada.");
}
function servirArquivo(req, res, caminho) {
  if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405, { Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" }); return res.end("Método não permitido."); }
  let relativo; try { relativo = decodeURIComponent(caminho); } catch (_) { res.writeHead(400); return res.end("Endereço inválido."); }
  if (relativo.endsWith("/")) relativo += "index.html";
  const arquivo = path.normalize(path.join(PASTA_ESTATICA, relativo));
  if (arquivo !== PASTA_ESTATICA && !arquivo.startsWith(PASTA_ESTATICA + path.sep)) { res.writeHead(403); return res.end("Acesso negado."); }
  fs.stat(arquivo, (e, info) => {
    if (e || !info.isFile()) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("Arquivo não encontrado."); }
    res.writeHead(200, { "Content-Type": TIPOS[path.extname(arquivo).toLowerCase()] || "application/octet-stream", "Content-Length": info.size, "Cache-Control": "no-cache" });
    if (req.method === "HEAD") return res.end(); fs.createReadStream(arquivo).pipe(res);
  });
}
if (process.argv.includes("--resetar")) { restaurarDadosIniciais(); console.log("Dados restaurados para o estado inicial."); process.exit(0); }
carregarDados();
const servidor = http.createServer(async (req, res) => {
  const inicio = Date.now(); res.on("finish", () => console.log(req.method + " " + req.url + " -> " + res.statusCode + " (" + (Date.now() - inicio) + "ms)"));
  try { const url = new URL(req.url, "http://localhost"); if (url.pathname.startsWith("/api/")) await tratarApi(req, res, url); else servirArquivo(req, res, url.pathname); }
  catch (e) {
    if (e instanceof ErroHttp) return erro(res, e.status, e.codigo, e.message, e.detalhes);
    console.error(e); erro(res, 500, "ERRO_INTERNO", "Erro interno do servidor.");
  }
});
servidor.on("error", (e) => { if (e.code === "EADDRINUSE") console.error("A porta " + PORTA + " já está em uso. Use npm start -- --porta=3001."); else console.error(e); process.exit(1); });
servidor.listen(PORTA, () => { console.log("MadeiraFlow rodando em http://localhost:" + PORTA); console.log("Atraso das respostas da API: " + ATRASO_MS + "ms (use --atraso=0 para desativar)."); });
