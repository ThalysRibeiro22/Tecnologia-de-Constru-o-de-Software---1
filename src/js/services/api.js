/*
 * Camada de comunicação com a API.
 *
 * É o único lugar do projeto que usa fetch diretamente. Os demais módulos
 * (serviços e telas) chamam obter() e enviar(), sem se preocupar com URL base,
 * cabeçalhos, tempo limite ou interpretação de erros.
 *
 * Tecnologia: Fetch API + async/await. Qualquer falha (servidor fora do ar,
 * resposta lenta demais, erro HTTP, resposta ilegível) vira um ErroDeApi, e
 * quem chamou decide como mostrar isso ao usuário.
 */

const BASE_API = "/api";
const LIMITE_PADRAO_MS = 8000;

export class ErroDeApi extends Error {
  constructor(mensagem, { status = 0, tipo = "desconhecido", causa = null } = {}) {
    super(mensagem);
    this.name = "ErroDeApi";
    this.status = status; // código HTTP (0 quando não houve resposta)
    this.tipo = tipo; // "rede" | "tempo-esgotado" | "http" | "resposta-invalida"
    this.causa = causa;
  }
}

async function criarErroHttp(resposta) {
  let mensagem = "O servidor respondeu com erro " + resposta.status + ".";

  try {
    const corpo = await resposta.json();
    if (corpo && corpo.erro) mensagem = corpo.erro;
  } catch (erro) {
    // resposta sem JSON: fica a mensagem genérica acima
  }

  return new ErroDeApi(mensagem, { status: resposta.status, tipo: "http" });
}

async function requisitar(caminho, opcoes = {}, limiteMs = LIMITE_PADRAO_MS) {
  // AbortController permite cancelar a requisição se o servidor demorar demais
  const controlador = new AbortController();
  const temporizador = setTimeout(function () {
    controlador.abort();
  }, limiteMs);

  try {
    const resposta = await fetch(BASE_API + caminho, {
      cache: "no-store",
      ...opcoes,
      signal: controlador.signal,
    });

    if (!resposta.ok) {
      throw await criarErroHttp(resposta);
    }

    if (resposta.status === 204) return null;

    try {
      return await resposta.json();
    } catch (erro) {
      if (erro && erro.name === "AbortError") throw erro;
      throw new ErroDeApi("A resposta do servidor não pôde ser interpretada.", {
        status: resposta.status,
        tipo: "resposta-invalida",
        causa: erro,
      });
    }
  } catch (erro) {
    if (erro instanceof ErroDeApi) throw erro;

    if (erro && erro.name === "AbortError") {
      throw new ErroDeApi("O servidor demorou demais para responder.", {
        tipo: "tempo-esgotado",
        causa: erro,
      });
    }

    // fetch só rejeita por falha de rede: servidor desligado, sem conexão etc.
    throw new ErroDeApi("Não foi possível se comunicar com o servidor.", {
      tipo: "rede",
      causa: erro,
    });
  } finally {
    clearTimeout(temporizador);
  }
}

// Consulta (GET)
export function obter(caminho, { limiteMs } = {}) {
  return requisitar(caminho, { method: "GET" }, limiteMs);
}

// Envio de dados (POST)
export function enviar(caminho, dados, { limiteMs } = {}) {
  return requisitar(
    caminho,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    },
    limiteMs
  );
}
