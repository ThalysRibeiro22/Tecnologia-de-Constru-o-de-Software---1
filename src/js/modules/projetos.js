/*
 * Formulário de novo projeto (novo-projeto.html).
 *
 * - Consulta os clientes na API (GET) para preencher o campo "Cliente".
 * - Valida o formulário e envia o novo projeto à API (POST).
 */

import { listarClientes } from "../services/clienteService.js";
import { cadastrarProjeto } from "../services/projetoService.js";
import {
  validarSelecaoDeCliente,
  validarTitulo,
  validarDescricao,
} from "../utils/validacao.js";
import {
  obterAreaDeEstado,
  mostrarErro,
  limparEstado,
  definirBotaoOcupado,
  definirErroDeCampo,
  mensagemDeErroDeEnvio,
} from "../utils/interface.js";

export function iniciarFormularioProjeto() {
  const formulario = document.getElementById("form-projeto");

  if (!formulario) {
    return; // esta tela só existe na página de Novo projeto
  }

  const campoCliente = document.getElementById("cliente");
  const campoTitulo = document.getElementById("titulo");
  const campoAmbiente = document.getElementById("ambiente");
  const campoDescricao = document.getElementById("descricao");
  const campoStatus = document.getElementById("status");
  const botaoCriar = formulario.querySelector('button[type="submit"]');
  const mensagemSucesso = document.getElementById("projeto-sucesso");
  const mensagemErro = document.getElementById("projeto-erro");
  const areaDeEstado = obterAreaDeEstado(campoCliente, "depois");

  function montarOpcoes(clientes) {
    campoCliente.innerHTML = "";

    const opcaoPadrao = document.createElement("option");
    opcaoPadrao.value = "";
    opcaoPadrao.textContent = "Selecione um cliente";
    campoCliente.appendChild(opcaoPadrao);

    clientes.forEach(function (cliente) {
      const opcao = document.createElement("option");
      opcao.value = cliente.id;
      opcao.textContent = cliente.nome;
      campoCliente.appendChild(opcao);
    });
  }

  // Consulta (GET) dos clientes. Enquanto ela acontece, o campo fica
  // desabilitado e indica "Carregando clientes...".
  async function carregarClientes() {
    campoCliente.innerHTML = "";
    const opcaoCarregando = document.createElement("option");
    opcaoCarregando.value = "";
    opcaoCarregando.textContent = "Carregando clientes...";
    campoCliente.appendChild(opcaoCarregando);

    campoCliente.disabled = true;
    campoCliente.setAttribute("aria-busy", "true");
    limparEstado(areaDeEstado);

    try {
      const clientes = await listarClientes();
      montarOpcoes(clientes);
    } catch (erro) {
      montarOpcoes([]);
      mostrarErro(areaDeEstado, "Não foi possível carregar os clientes.", carregarClientes);
    } finally {
      campoCliente.disabled = false;
      campoCliente.removeAttribute("aria-busy");
    }
  }

  function validarFormulario() {
    const erroCliente = validarSelecaoDeCliente(campoCliente.value);
    const erroTitulo = validarTitulo(campoTitulo.value);
    const erroDescricao = validarDescricao(campoDescricao.value);

    definirErroDeCampo(campoCliente, erroCliente);
    definirErroDeCampo(campoTitulo, erroTitulo);
    definirErroDeCampo(campoDescricao, erroDescricao);

    return erroCliente === "" && erroTitulo === "" && erroDescricao === "";
  }

  // Envio (POST) do novo projeto
  formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    mensagemSucesso.hidden = true;
    mensagemErro.hidden = true;

    if (!validarFormulario()) {
      return;
    }

    definirBotaoOcupado(botaoCriar, true, "Salvando...");

    try {
      const projeto = await cadastrarProjeto({
        clienteId: campoCliente.value,
        titulo: campoTitulo.value.trim(),
        ambiente: campoAmbiente.value.trim(),
        descricao: campoDescricao.value.trim(),
        status: campoStatus.value,
      });

      mensagemSucesso.textContent =
        'Projeto "' +
        projeto.titulo +
        '" cadastrado para ' +
        projeto.clienteNome +
        " (status inicial: " +
        projeto.statusLabel +
        "). Ele já aparece no Painel.";
      mensagemSucesso.hidden = false;

      formulario.reset();
    } catch (erro) {
      // O formulário não é limpo: os dados digitados ficam para uma nova tentativa
      mensagemErro.textContent = mensagemDeErroDeEnvio(
        erro,
        "Não foi possível cadastrar o projeto."
      );
      mensagemErro.hidden = false;
    } finally {
      definirBotaoOcupado(botaoCriar, false);
    }
  });

  // Depois de um erro mostrado, revalida o campo enquanto o usuário corrige
  [campoCliente, campoTitulo, campoDescricao].forEach(function (campo) {
    const tipoDeEvento = campo.tagName === "SELECT" ? "change" : "input";
    campo.addEventListener(tipoDeEvento, function () {
      if (campo.closest(".field").classList.contains("has-error")) {
        validarFormulario();
      }
    });
  });

  carregarClientes();
}
