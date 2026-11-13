/*
 * MadeiraFlow - Etapa 05: servidor local (páginas + API simulada)
 *
 * Este arquivo usa apenas módulos que já vêm com o Node.js (http, fs, path),
 * então não é preciso rodar "npm install". Ele faz duas coisas:
 *
 *   1. Entrega os arquivos da pasta src/ (HTML, CSS, JS). Isso é necessário
 *      porque módulos ES6 (<script type="module">) não funcionam abrindo o
 *      HTML direto pelo navegador (file://).
 *
 *   2. Responde às requisições da API em /api/..., guardando os dados em
 *      servidor/dados.json. É isso que torna o cadastro persistente: os dados
 *      deixam de ficar no navegador e passam a ficar neste "servidor".
 *
 * Como o servidor real de uma aplicação seria, ele também valida os dados que
 * recebe e responde com os códigos HTTP adequados (201, 404, 422, 503...).
 *
 * Opções (variáveis de ambiente ou argumentos):
 *   --porta=3000   (ou PORT=3000)         porta do servidor
 *   --atraso=800   (ou ATRASO_MS=800)     atraso artificial, em milissegundos,
 *                                          aplicado às respostas da API para
 *                                          que os indicadores de carregamento
 *                                          fiquem visíveis na demonstração
 *   --resetar                              restaura os dados iniciais e sai
 */

"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

/* ==========================================================================
   Configuração
   ========================================================================== */

function lerArgumento(nome) {
  const prefixo = "--" + nome + "=";
  const encontrado = process.argv.find(function (argumento) {
    return argumento.startsWith(prefixo);
  });
  return encontrado ? encontrado.slice(prefixo.length) : undefined;
}

function lerNumero(valor, padrao) {
  const numero = Number(valor);
  return valor !== undefined && valor !== "" && Number.isFinite(numero) && numero >= 0
    ? numero
    : padrao;
}

const PORTA = lerNumero(lerArgumento("porta") || process.env.PORT, 3000);
const ATRASO_MS = lerNumero(lerArgumento("atraso") || process.env.ATRASO_MS, 800);

const PASTA_ESTATICA = path.join(__dirname, "..", "src");
const ARQUIVO_INICIAL = path.join(__dirname, "dados.inicial.json");
const ARQUIVO_DADOS = process.env.ARQUIVO_DADOS || path.join(__dirname, "dados.json");

const REGEX_TELEFONE = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROTULOS_DE_STATUS = {
  orcamento: "Orçamento",
  aprovado: "Aprovado",
  producao: "Em produção",
  pronto: "Pronto",
  entregue: "Entregue",
};

const TIPOS_DE_ARQUIVO = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", // obrigatório para módulos ES6
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// Quando verdadeiro, toda a API responde 503 (indisponível). É ligado e
// desligado pelas rotas /api/_simulacao/... para demonstrar o tratamento de erro.
let modoFalha = false;

/* ==========================================================================
   Persistência em arquivo
   ========================================================================== */

function restaurarDadosIniciais() {
  fs.copyFileSync(ARQUIVO_INICIAL, ARQUIVO_DADOS);
}

function carregarDados() {
  if (!fs.existsSync(ARQUIVO_DADOS)) {
    restaurarDadosIniciais(); // primeira execução: parte dos dados originais
  }
  const dados = JSON.parse(fs.readFileSync(ARQUIVO_DADOS, "utf-8"));
  dados.clientes = Array.isArray(dados.clientes) ? dados.clientes : [];
  dados.projetos = Array.isArray(dados.projetos) ? dados.projetos : [];
  return dados;
}

function salvarDados(dados) {
  fs.writeFileSync(ARQUIVO_DADOS, JSON.stringify(dados, null, 2), "utf-8");
}

/* ==========================================================================
   Utilidades
   ========================================================================== */

class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

function esperar(milissegundos) {
  return new Promise(function (resolver) {
    setTimeout(resolver, milissegundos);
  });
}

function gerarId(prefixo) {
  return prefixo + "-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function dataAtualFormatada() {
  const agora = new Date();
  const dia = String(agora.getDate()).padStart(2, "0");
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  return dia + "/" + mes + "/" + agora.getFullYear();
}

function texto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

function enviarJson(resposta, status, corpo) {
  resposta.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    // Impede o navegador de reaproveitar uma consulta antiga (cache)
    "Cache-Control": "no-store",
  });
  resposta.end(JSON.stringify(corpo));
}

function enviarTexto(resposta, status, conteudo) {
  resposta.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  resposta.end(conteudo);
}

function lerCorpoJson(requisicao) {
  return new Promise(function (resolver, rejeitar) {
    const pedacos = [];
    let tamanho = 0;

    requisicao.on("data", function (pedaco) {
      tamanho += pedaco.length;
      if (tamanho > 1000000) {
        rejeitar(new ErroHttp(413, "Os dados enviados são grandes demais."));
        requisicao.destroy();
        return;
      }
      pedacos.push(pedaco);
    });

    requisicao.on("end", function () {
      try {
        const bruto = Buffer.concat(pedacos).toString("utf-8");
        resolver(bruto ? JSON.parse(bruto) : {});
      } catch (erro) {
        rejeitar(new ErroHttp(400, "O corpo da requisição não é um JSON válido."));
      }
    });

    requisicao.on("error", rejeitar);
  });
}

/* ==========================================================================
   Regras da API
   ========================================================================== */

function validarCliente(corpo) {
  const nome = texto(corpo.nome);
  const telefone = texto(corpo.telefone);
  const email = texto(corpo.email);

  if (nome === "") throw new ErroHttp(422, "Informe o nome do cliente.");
  if (telefone === "") throw new ErroHttp(422, "Informe o telefone do cliente.");
  if (!REGEX_TELEFONE.test(telefone)) {
    throw new ErroHttp(422, "Use o formato (00) 00000-0000.");
  }
  if (email !== "" && !REGEX_EMAIL.test(email)) {
    throw new ErroHttp(422, "Informe um e-mail válido.");
  }

  return { nome: nome, telefone: telefone, email: email };
}

function validarProjeto(corpo, dados) {
  const titulo = texto(corpo.titulo);
  const descricao = texto(corpo.descricao);
  const clienteId = texto(corpo.clienteId);
  const status = texto(corpo.status) || "orcamento";

  if (clienteId === "") throw new ErroHttp(422, "Selecione um cliente.");
  if (titulo === "") throw new ErroHttp(422, "Informe o título do projeto.");
  if (descricao === "") throw new ErroHttp(422, "Descreva o projeto para continuar.");
  if (!ROTULOS_DE_STATUS[status]) throw new ErroHttp(422, "Status de projeto inválido.");

  const cliente = dados.clientes.find(function (item) {
    return item.id === clienteId;
  });
  if (!cliente) throw new ErroHttp(422, "O cliente informado não existe.");

  return {
    titulo: titulo,
    clienteId: cliente.id,
    clienteNome: cliente.nome, // o servidor resolve o nome a partir do id
    ambiente: texto(corpo.ambiente),
    descricao: descricao,
    status: status,
    statusLabel: ROTULOS_DE_STATUS[status],
  };
}

// Recebe dados antigos (que estavam no localStorage do navegador) e incorpora
// ao servidor, sem duplicar o que já existe (comparação pelo id).
function importarDados(corpo, dados) {
  const clientesRecebidos = Array.isArray(corpo.clientes) ? corpo.clientes : [];
  const projetosRecebidos = Array.isArray(corpo.projetos) ? corpo.projetos : [];

  let clientesImportados = 0;
  let projetosImportados = 0;

  clientesRecebidos.forEach(function (cliente) {
    const id = texto(cliente && cliente.id);
    if (id === "" || texto(cliente.nome) === "") return;
    if (dados.clientes.some(function (item) { return item.id === id; })) return;

    dados.clientes.push({
      id: id,
      nome: texto(cliente.nome),
      telefone: texto(cliente.telefone),
      email: texto(cliente.email),
    });
    clientesImportados += 1;
  });

  projetosRecebidos.forEach(function (projeto) {
    const id = texto(projeto && projeto.id);
    if (id === "" || texto(projeto.titulo) === "") return;
    if (dados.projetos.some(function (item) { return item.id === id; })) return;

    dados.projetos.push({
      id: id,
      titulo: texto(projeto.titulo),
      clienteId: texto(projeto.clienteId),
      clienteNome: texto(projeto.clienteNome),
      ambiente: texto(projeto.ambiente),
      descricao: texto(projeto.descricao),
      status: texto(projeto.status) || "orcamento",
      statusLabel: texto(projeto.statusLabel) || "Orçamento",
      dataCriacao: texto(projeto.dataCriacao) || dataAtualFormatada(),
      link: texto(projeto.link),
    });
    projetosImportados += 1;
  });

  return { clientesImportados: clientesImportados, projetosImportados: projetosImportados };
}

/* ==========================================================================
   Rotas
   ========================================================================== */

async function tratarApi(requisicao, resposta, caminho) {
  // Rotas de controle da demonstração: não sofrem atraso nem falha simulada.
  if (caminho === "/api/_simulacao/falha") {
    modoFalha = true;
    return enviarTexto(resposta, 200, "API em modo de falha: todas as consultas e cadastros responderão 503.\nPara voltar ao normal, acesse /api/_simulacao/normal");
  }
  if (caminho === "/api/_simulacao/normal") {
    modoFalha = false;
    return enviarTexto(resposta, 200, "API funcionando normalmente.");
  }
  if (caminho === "/api/_simulacao/status") {
    return enviarTexto(resposta, 200, modoFalha ? "falha" : "normal");
  }

  await esperar(ATRASO_MS); // simula o tempo de resposta de uma rede/servidor real

  if (modoFalha) {
    return enviarJson(resposta, 503, { erro: "Serviço indisponível (falha simulada)." });
  }

  const metodo = requisicao.method;
  const dados = carregarDados();

  if (caminho === "/api/clientes") {
    if (metodo === "GET") return enviarJson(resposta, 200, dados.clientes);
    if (metodo === "POST") {
      const corpo = await lerCorpoJson(requisicao);
      const novoCliente = Object.assign({ id: gerarId("cliente") }, validarCliente(corpo));
      dados.clientes.unshift(novoCliente); // o mais recente aparece primeiro
      salvarDados(dados);
      return enviarJson(resposta, 201, novoCliente);
    }
    throw new ErroHttp(405, "Método não permitido.");
  }

  if (caminho === "/api/projetos") {
    if (metodo === "GET") return enviarJson(resposta, 200, dados.projetos);
    if (metodo === "POST") {
      const corpo = await lerCorpoJson(requisicao);
      const novoProjeto = Object.assign(
        { id: gerarId("projeto") },
        validarProjeto(corpo, dados),
        { dataCriacao: dataAtualFormatada(), link: "" }
      );
      dados.projetos.unshift(novoProjeto);
      salvarDados(dados);
      return enviarJson(resposta, 201, novoProjeto);
    }
    throw new ErroHttp(405, "Método não permitido.");
  }

  if (caminho === "/api/migracao") {
    if (metodo !== "POST") throw new ErroHttp(405, "Método não permitido.");
    const corpo = await lerCorpoJson(requisicao);
    const resultado = importarDados(corpo, dados);
    salvarDados(dados);
    return enviarJson(resposta, 200, resultado);
  }

  throw new ErroHttp(404, "Rota da API não encontrada.");
}

/* ==========================================================================
   Arquivos estáticos (pasta src/)
   ========================================================================== */

function servirArquivo(requisicao, resposta, caminho) {
  if (requisicao.method !== "GET" && requisicao.method !== "HEAD") {
    return enviarTexto(resposta, 405, "Método não permitido.");
  }

  let relativo;
  try {
    relativo = decodeURIComponent(caminho);
  } catch (erro) {
    return enviarTexto(resposta, 400, "Endereço inválido.");
  }

  if (relativo.endsWith("/")) relativo += "index.html";

  const arquivo = path.normalize(path.join(PASTA_ESTATICA, relativo));

  // Segurança: impede acessar arquivos fora da pasta src/ (ex.: /../servidor)
  if (arquivo !== PASTA_ESTATICA && !arquivo.startsWith(PASTA_ESTATICA + path.sep)) {
    return enviarTexto(resposta, 403, "Acesso negado.");
  }

  fs.stat(arquivo, function (erro, informacoes) {
    if (erro || !informacoes.isFile()) {
      return enviarTexto(resposta, 404, "Arquivo não encontrado.");
    }

    const tipo = TIPOS_DE_ARQUIVO[path.extname(arquivo).toLowerCase()] || "application/octet-stream";
    resposta.writeHead(200, {
      "Content-Type": tipo,
      "Content-Length": informacoes.size,
      // Sempre revalida: assim, ao editar um arquivo, o navegador não usa uma cópia velha
      "Cache-Control": "no-cache",
    });

    if (requisicao.method === "HEAD") return resposta.end();
    fs.createReadStream(arquivo).pipe(resposta);
  });
}

/* ==========================================================================
   Inicialização
   ========================================================================== */

if (process.argv.includes("--resetar")) {
  restaurarDadosIniciais();
  console.log("Dados restaurados para o estado inicial (servidor/dados.json).");
  process.exit(0);
}

carregarDados(); // garante que o arquivo de dados exista antes de aceitar requisições

const servidor = http.createServer(async function (requisicao, resposta) {
  const inicio = Date.now();

  resposta.on("finish", function () {
    console.log(requisicao.method + " " + requisicao.url + " -> " + resposta.statusCode + " (" + (Date.now() - inicio) + "ms)");
  });

  try {
    const caminho = new URL(requisicao.url, "http://localhost").pathname;

    if (caminho.startsWith("/api/")) {
      await tratarApi(requisicao, resposta, caminho);
    } else {
      servirArquivo(requisicao, resposta, caminho);
    }
  } catch (erro) {
    if (erro instanceof ErroHttp) {
      return enviarJson(resposta, erro.status, { erro: erro.message });
    }
    console.error(erro);
    enviarJson(resposta, 500, { erro: "Erro interno do servidor." });
  }
});

servidor.on("error", function (erro) {
  if (erro.code === "EADDRINUSE") {
    console.error("A porta " + PORTA + " já está em uso. Feche o outro servidor ou use outra porta:");
    console.error("  npm start -- --porta=3001");
  } else {
    console.error(erro);
  }
  process.exit(1);
});

servidor.listen(PORTA, function () {
  console.log("MadeiraFlow rodando em http://localhost:" + PORTA);
  console.log("  Atraso simulado das respostas da API: " + ATRASO_MS + "ms");
  console.log("  Simular indisponibilidade: http://localhost:" + PORTA + "/api/_simulacao/falha");
  console.log("  Voltar ao normal:          http://localhost:" + PORTA + "/api/_simulacao/normal");
  console.log("  (Ctrl+C para encerrar)");
});
