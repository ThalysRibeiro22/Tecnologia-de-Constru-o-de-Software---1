/*
 * Cadastro e lista de clientes (cliente.html).
 *
 * - Consulta clientes e projetos na API (GET) para montar a lista.
 * - Valida o formulário e envia o novo cliente à API (POST).
 */

import { listarClientes, cadastrarCliente } from "../services/clienteService.js";
import { listarProjetos } from "../services/projetoService.js";
import { validarNome, validarTelefone, validarEmail } from "../utils/validacao.js";
import {
  obterAreaDeEstado,
  mostrarCarregando,
  mostrarErro,
  mostrarSucesso,
  removerCarregando,
  definirBotaoOcupado,
  definirErroDeCampo,
  mensagemDeErroDeEnvio,
} from "../utils/interface.js";

export function iniciarClientes() {
  const formulario = document.getElementById("form-cliente");

  if (!formulario) {
    return; // esta tela só existe na página de Clientes
  }

  const campoNome = document.getElementById("nome");
  const campoTelefone = document.getElementById("telefone");
  const campoEmail = document.getElementById("email");
  const botaoSalvar = formulario.querySelector('button[type="submit"]');
  const mensagemSucesso = document.getElementById("cliente-sucesso");
  const mensagemErro = document.getElementById("cliente-erro");
  const lista = document.getElementById("lista-clientes");
  const areaDeEstado = obterAreaDeEstado(lista);

  function renderizarClientes(clientes, projetos) {
    lista.innerHTML = "";
    clientes.forEach(function (cliente) {
      lista.appendChild(criarCardDeCliente(cliente, projetos));
    });
  }

  // Consulta (GET) de clientes e projetos em paralelo. Os projetos são
  // necessários para contar quantos projetos cada cliente possui.
  // "manterLista" evita esvaziar a lista enquanto ela é atualizada após um cadastro.
  async function carregarClientes({ manterLista = false } = {}) {
    if (!manterLista) lista.innerHTML = "";
    lista.setAttribute("aria-busy", "true");
    mostrarCarregando(areaDeEstado, "Carregando clientes...");

    try {
      const [clientes, projetos] = await Promise.all([listarClientes(), listarProjetos()]);

      renderizarClientes(clientes, projetos);
      mostrarSucesso(areaDeEstado, descreverQuantidade(clientes.length));
    } catch (erro) {
      mostrarErro(
        areaDeEstado,
        "Não foi possível carregar os clientes. Tente novamente.",
        function () {
          carregarClientes({ manterLista: manterLista });
        }
      );
    } finally {
      removerCarregando(areaDeEstado);
      lista.removeAttribute("aria-busy");
    }
  }

  function validarFormulario() {
    const erroNome = validarNome(campoNome.value);
    const erroTelefone = validarTelefone(campoTelefone.value);
    const erroEmail = validarEmail(campoEmail.value);

    definirErroDeCampo(campoNome, erroNome);
    definirErroDeCampo(campoTelefone, erroTelefone);
    definirErroDeCampo(campoEmail, erroEmail);

    return erroNome === "" && erroTelefone === "" && erroEmail === "";
  }

  // Envio (POST) do novo cliente
  formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    mensagemSucesso.hidden = true;
    mensagemErro.hidden = true;

    if (!validarFormulario()) {
      return;
    }

    definirBotaoOcupado(botaoSalvar, true, "Salvando...");

    try {
      await cadastrarCliente({
        nome: campoNome.value.trim(),
        telefone: campoTelefone.value.trim(),
        email: campoEmail.value.trim(),
      });

      mensagemSucesso.hidden = false;
      formulario.reset();

      // Atualiza a lista com o que o servidor realmente tem salvo
      carregarClientes({ manterLista: true });
    } catch (erro) {
      // O formulário não é limpo: os dados digitados ficam para uma nova tentativa
      mensagemErro.textContent = mensagemDeErroDeEnvio(
        erro,
        "Ocorreu um erro ao salvar o cliente."
      );
      mensagemErro.hidden = false;
    } finally {
      definirBotaoOcupado(botaoSalvar, false);
    }
  });

  // Depois de um erro mostrado, revalida o campo enquanto o usuário corrige
  [campoNome, campoTelefone, campoEmail].forEach(function (campo) {
    campo.addEventListener("input", function () {
      if (campo.closest(".field").classList.contains("has-error")) {
        validarFormulario();
      }
    });
  });

  carregarClientes();
}

function descreverQuantidade(quantidade) {
  if (quantidade === 0) return "Nenhum cliente cadastrado ainda.";
  if (quantidade === 1) return "1 cliente carregado.";
  return quantidade + " clientes carregados.";
}

function criarCardDeCliente(cliente, projetos) {
  const projetosDoCliente = projetos.filter(function (projeto) {
    return projeto.clienteId === cliente.id;
  });

  const artigo = document.createElement("article");
  artigo.className = "card";

  const topo = document.createElement("div");
  topo.className = "card__top";

  const titulo = document.createElement("h3");
  titulo.className = "card__title";
  titulo.textContent = cliente.nome;

  topo.appendChild(titulo);

  const contato = [cliente.telefone, cliente.email]
    .filter(function (dado) {
      return dado !== "";
    })
    .join(" · ");

  const descricao = document.createElement("p");
  descricao.className = "card__desc";
  descricao.textContent = contato;

  const rodape = document.createElement("div");
  rodape.className = "card__footer";

  const contador = document.createElement("span");
  contador.textContent =
    projetosDoCliente.length === 1
      ? "1 projeto vinculado"
      : projetosDoCliente.length + " projetos vinculados";

  const link = document.createElement("a");
  if (projetosDoCliente.length === 1 && projetosDoCliente[0].link) {
    link.href = projetosDoCliente[0].link;
    link.textContent = "Ver projeto";
  } else {
    link.href = "index.html";
    link.textContent = projetosDoCliente.length > 0 ? "Ver projetos" : "Ver painel";
  }

  rodape.appendChild(contador);
  rodape.appendChild(link);

  artigo.appendChild(topo);
  artigo.appendChild(descricao);
  artigo.appendChild(rodape);

  return artigo;
}
