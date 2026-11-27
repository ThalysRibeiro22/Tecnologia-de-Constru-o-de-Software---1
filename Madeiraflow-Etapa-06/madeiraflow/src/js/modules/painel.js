/*
 * Painel de projetos (index.html).
 *
 * Consulta os projetos na API (GET), desenha os cards e mantém os filtros por
 * cliente e status funcionando sobre os dados recebidos.
 */

import { listarProjetos } from "../services/projetoService.js";
import {
  obterAreaDeEstado,
  mostrarCarregando,
  mostrarErro,
  mostrarSucesso,
  removerCarregando,
} from "../utils/interface.js";

export function iniciarPainel() {
  const lista = document.getElementById("lista-projetos");
  const formulario = document.getElementById("form-busca");

  if (!lista || !formulario) {
    return; // esta tela só existe no Painel
  }

  const campoCliente = document.getElementById("busca-cliente");
  const campoStatus = document.getElementById("filtro-status");
  const areaDeEstado = obterAreaDeEstado(lista);

  // Enquanto os projetos não chegam da API, o filtro não tem o que filtrar
  let projetosCarregados = false;

  function renderizarProjetos(projetos) {
    lista.innerHTML = "";
    projetos.forEach(function (projeto) {
      lista.appendChild(criarCardDeProjeto(projeto));
    });
  }

  function filtrarProjetos() {
    if (!projetosCarregados) return;

    const termo = campoCliente.value.trim().toLowerCase();
    const status = campoStatus.value;

    const cards = Array.from(lista.querySelectorAll(".card"));

    const resultados = cards.filter(function (card) {
      const clienteDoCard = (card.dataset.cliente || "").toLowerCase();
      const tituloDoCard = (card.dataset.titulo || "").toLowerCase();
      const statusDoCard = card.dataset.status || "";

      const correspondeAoTermo =
        termo === "" || clienteDoCard.includes(termo) || tituloDoCard.includes(termo);
      const correspondeAoStatus = status === "" || statusDoCard === status;

      return correspondeAoTermo && correspondeAoStatus;
    });

    cards.forEach(function (card) {
      card.hidden = resultados.indexOf(card) === -1;
    });

    // Sem nenhum projeto cadastrado não faz sentido falar em "busca sem resultado"
    exibirOuOcultarMensagemVazia(cards.length > 0 && resultados.length === 0);
  }

  function exibirOuOcultarMensagemVazia(nenhumResultado) {
    let mensagem = document.getElementById("projetos-vazio");

    if (nenhumResultado && !mensagem) {
      mensagem = document.createElement("p");
      mensagem.id = "projetos-vazio";
      mensagem.className = "empty-state";
      mensagem.textContent = "Não encontramos projetos para essa busca.";
      lista.appendChild(mensagem);
    }

    if (!nenhumResultado && mensagem) {
      mensagem.remove();
    }
  }

  // Consulta (GET) com estados de carregamento, sucesso e erro
  async function carregarProjetos() {
    projetosCarregados = false;
    lista.innerHTML = "";
    lista.setAttribute("aria-busy", "true");
    mostrarCarregando(areaDeEstado, "Carregando projetos...");

    try {
      const projetos = await listarProjetos();

      renderizarProjetos(projetos);
      projetosCarregados = true;
      filtrarProjetos();

      mostrarSucesso(areaDeEstado, descreverQuantidade(projetos.length));
    } catch (erro) {
      mostrarErro(
        areaDeEstado,
        "Não foi possível carregar os projetos. Tente novamente.",
        carregarProjetos
      );
    } finally {
      // Roda sempre, com sucesso ou erro: o indicador de carregamento não pode ficar
      removerCarregando(areaDeEstado);
      lista.removeAttribute("aria-busy");
    }
  }

  campoCliente.addEventListener("input", filtrarProjetos);
  campoStatus.addEventListener("change", filtrarProjetos);

  // "Filtrar" e a tecla Enter aplicam o mesmo filtro, sem recarregar a página
  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    filtrarProjetos();
  });

  carregarProjetos();
}

function descreverQuantidade(quantidade) {
  if (quantidade === 0) return "Nenhum projeto cadastrado ainda.";
  if (quantidade === 1) return "1 projeto carregado.";
  return quantidade + " projetos carregados.";
}

function criarCardDeProjeto(projeto) {
  const artigo = document.createElement("article");
  artigo.className = "card";
  artigo.dataset.status = projeto.status;
  artigo.dataset.cliente = projeto.clienteNome;
  artigo.dataset.titulo = projeto.titulo;

  const topo = document.createElement("div");
  topo.className = "card__top";

  const titulo = document.createElement("h3");
  titulo.className = "card__title";
  titulo.textContent = projeto.titulo;

  const etiqueta = document.createElement("span");
  etiqueta.className = "tag " + classeDaEtiquetaDeStatus(projeto.status);
  etiqueta.textContent = projeto.statusLabel;

  topo.appendChild(titulo);
  topo.appendChild(etiqueta);

  const cliente = document.createElement("p");
  cliente.className = "card__client";
  cliente.textContent = "Cliente: " + projeto.clienteNome;

  const descricao = document.createElement("p");
  descricao.className = "card__desc";
  descricao.textContent = projeto.descricao;

  const rodape = document.createElement("div");
  rodape.className = "card__footer";

  const data = document.createElement("span");
  data.textContent = "Criado em " + projeto.dataCriacao;
  rodape.appendChild(data);

  // Só os projetos originais têm uma página de detalhes própria
  if (projeto.link) {
    const link = document.createElement("a");
    link.href = projeto.link;
    link.textContent = "Ver detalhes";
    rodape.appendChild(link);
  }

  artigo.appendChild(topo);
  artigo.appendChild(cliente);
  artigo.appendChild(descricao);
  artigo.appendChild(rodape);

  return artigo;
}

function classeDaEtiquetaDeStatus(status) {
  const mapa = {
    orcamento: "tag--pendente",
    aprovado: "tag--aprovado",
    producao: "tag--producao",
    pronto: "tag--aprovado",
    entregue: "tag--entregue",
  };
  return mapa[status] || "";
}
