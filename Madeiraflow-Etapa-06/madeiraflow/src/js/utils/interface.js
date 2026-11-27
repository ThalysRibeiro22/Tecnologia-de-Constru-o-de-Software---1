/*
 * Utilidades de interface compartilhadas pelos módulos.
 *
 * Reúne tudo o que mostra ao usuário o "estado" de uma operação assíncrona
 * (carregando, erro, sucesso) e o feedback dos campos de formulário. Assim,
 * cada módulo só decide QUANDO mostrar, e este arquivo cuida de COMO mostrar.
 */

/* ---------- Área de estado (carregando / erro / sucesso) ---------- */

// Cria (ou reaproveita) um bloco próprio para as mensagens de estado, colocado
// logo antes ou depois do elemento de referência (uma lista, um campo...).
export function obterAreaDeEstado(referencia, posicao = "antes") {
  const idDaArea = "estado-" + referencia.id;
  let area = document.getElementById(idDaArea);

  if (!area) {
    area = document.createElement("div");
    area.id = idDaArea;
    area.className = "area-estado";
    if (posicao === "depois") {
      referencia.after(area);
    } else {
      referencia.before(area);
    }
  }

  return area;
}

function criarCaixa(classeDoTipo, papelAria) {
  const caixa = document.createElement("div");
  caixa.className = "estado " + classeDoTipo;
  caixa.setAttribute("role", papelAria);
  return caixa;
}

export function mostrarCarregando(area, texto) {
  area.innerHTML = "";

  const caixa = criarCaixa("estado--carregando", "status");

  const giro = document.createElement("span");
  giro.className = "spinner";
  giro.setAttribute("aria-hidden", "true");

  const mensagem = document.createElement("span");
  mensagem.textContent = texto;

  caixa.appendChild(giro);
  caixa.appendChild(mensagem);
  area.appendChild(caixa);
}

// Mostra a mensagem de erro e, se informado, um botão para tentar novamente.
export function mostrarErro(area, texto, aoTentarNovamente) {
  area.innerHTML = "";

  const caixa = criarCaixa("estado--erro", "alert");

  const mensagem = document.createElement("span");
  mensagem.textContent = texto;
  caixa.appendChild(mensagem);

  if (typeof aoTentarNovamente === "function") {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "secondary";
    botao.textContent = "Tentar novamente";
    botao.addEventListener("click", function () {
      botao.disabled = true; // evita cliques repetidos enquanto a nova consulta começa
      aoTentarNovamente();
    });
    caixa.appendChild(botao);
  }

  area.appendChild(caixa);
}

export function mostrarSucesso(area, texto) {
  area.innerHTML = "";

  const caixa = criarCaixa("estado--sucesso", "status");
  caixa.textContent = texto;
  area.appendChild(caixa);
}

// Remove apenas o indicador de carregamento (usado no bloco "finally" das
// operações assíncronas, quando já foi exibido o sucesso ou o erro).
export function removerCarregando(area) {
  area.querySelectorAll(".estado--carregando").forEach(function (elemento) {
    elemento.remove();
  });
}

export function limparEstado(area) {
  area.innerHTML = "";
}

/* ---------- Botão ocupado ("Salvando...") ---------- */

export function definirBotaoOcupado(botao, ocupado, textoOcupado = "Salvando...") {
  if (!botao) return;

  if (ocupado) {
    botao.dataset.textoOriginal = botao.textContent;
    botao.textContent = textoOcupado;
    botao.disabled = true;
    botao.setAttribute("aria-busy", "true");
  } else {
    if (botao.dataset.textoOriginal) {
      botao.textContent = botao.dataset.textoOriginal;
      delete botao.dataset.textoOriginal;
    }
    botao.disabled = false;
    botao.removeAttribute("aria-busy");
  }
}

/* ---------- Feedback dos campos de formulário ---------- */

export function definirErroDeCampo(campo, mensagem) {
  const spanErro = document.getElementById("erro-" + campo.id);
  const wrapper = campo.closest(".field");

  if (mensagem) {
    wrapper.classList.add("has-error");
    campo.setAttribute("aria-invalid", "true");
    if (spanErro) spanErro.textContent = mensagem;
  } else {
    wrapper.classList.remove("has-error");
    campo.removeAttribute("aria-invalid");
    if (spanErro) spanErro.textContent = "";
  }
}

// Quando o servidor recusa os dados (422), a mensagem dele já é amigável e
// específica; nos demais casos usa-se a mensagem padrão da tela.
export function mensagemDeErroDeEnvio(erro, mensagemPadrao) {
  return erro && erro.status === 422 ? erro.message : mensagemPadrao;
}
