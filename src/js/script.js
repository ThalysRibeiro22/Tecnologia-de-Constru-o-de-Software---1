/*
 * MadeiraFlow - Etapa 04: Interatividade com JavaScript
 * (revisado para corrigir a busca e persistir dados entre páginas)
 *
 * Este arquivo é compartilhado por index.html, cliente.html e
 * novo-projeto.html. Cada função de inicialização confere se os
 * elementos da sua página existem antes de rodar, então o mesmo
 * script.js pode ser incluído nas três sem gerar erro.
 *
 * Persistência: como o projeto não tem servidor/banco de dados, os
 * clientes e projetos cadastrados pelo usuário são guardados no
 * localStorage do navegador, em duas chaves (ver CHAVES_STORAGE).
 * Na primeira execução, essas chaves são preenchidas com os mesmos
 * dados que já apareciam no HTML original; depois disso, cada novo
 * cadastro é incorporado a esses dados, sem apagar os anteriores.
 */

const CHAVES_STORAGE = {
  clientes: "madeiraflow:clientes",
  projetos: "madeiraflow:projetos",
};

document.addEventListener("DOMContentLoaded", function () {
  initPainelDeProjetos();
  initFormularioCliente();
  initFormularioProjeto();
});

/* ==========================================================================
   Utilidades de armazenamento (localStorage)
   ========================================================================== */

function lerDoStorage(chave) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : null;
  } catch (erro) {
    console.warn("Não foi possível ler " + chave + " do localStorage.", erro);
    return null;
  }
}

function salvarNoStorage(chave, dados) {
  try {
    localStorage.setItem(chave, JSON.stringify(dados));
  } catch (erro) {
    console.warn("Não foi possível salvar " + chave + " no localStorage.", erro);
  }
}

function gerarId(prefixo) {
  return prefixo + "-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function formatarDataAtual() {
  const agora = new Date();
  const dia = String(agora.getDate()).padStart(2, "0");
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const ano = agora.getFullYear();
  return dia + "/" + mes + "/" + ano;
}

/* ==========================================================================
   Dados iniciais (usados apenas quando o localStorage ainda está vazio)
   São exatamente os mesmos clientes e projetos que já existiam no HTML.
   ========================================================================== */

function obterClientesIniciais() {
  return [
    {
      id: "renata-almeida",
      nome: "Renata Almeida",
      telefone: "(11) 98765-4321",
      email: "renata.almeida@email.com",
    },
    {
      id: "joao-santos",
      nome: "João Pedro Santos",
      telefone: "(11) 91234-5678",
      email: "joao.santos@email.com",
    },
    {
      id: "marcos-lima",
      nome: "Marcos Vinícius Lima",
      telefone: "(11) 99876-1122",
      email: "marcos.lima@email.com",
    },
  ];
}

function obterProjetosIniciais() {
  return [
    {
      id: "projeto-armario-sala",
      titulo: "Armário planejado - sala de estar",
      clienteId: "renata-almeida",
      clienteNome: "Renata Almeida",
      ambiente: "sala de estar",
      descricao: "Armário sob medida com portas de correr e nichos para TV.",
      status: "producao",
      statusLabel: "Em produção",
      dataCriacao: "12/08/2026",
      link: "projeto-armario-sala.html",
    },
    {
      id: "projeto-cozinha",
      titulo: "Cozinha planejada completa",
      clienteId: "joao-santos",
      clienteNome: "João Pedro Santos",
      ambiente: "cozinha",
      descricao: "Cozinha em L com bancada e armários superiores.",
      status: "orcamento",
      statusLabel: "Orçamento pendente",
      dataCriacao: "20/08/2026",
      link: "projeto-cozinha.html",
    },
    {
      id: "projeto-guarda-roupa",
      titulo: "Guarda-roupa casal",
      clienteId: "marcos-lima",
      clienteNome: "Marcos Vinícius Lima",
      ambiente: "quarto do casal",
      descricao: "Guarda-roupa de 6 portas com espelho central.",
      status: "aprovado",
      statusLabel: "Aprovado",
      dataCriacao: "25/08/2026",
      link: "projeto-guarda-roupa.html",
    },
    {
      id: "projeto-escrivaninha",
      titulo: "Escrivaninha para home office",
      clienteId: "renata-almeida",
      clienteNome: "Renata Almeida",
      ambiente: "home office",
      descricao: "Escrivaninha compacta com gaveteiro e nichos.",
      status: "entregue",
      statusLabel: "Entregue",
      dataCriacao: "02/07/2026",
      link: "projeto-escrivaninha.html",
    },
  ];
}

/* ==========================================================================
   Camada de dados: clientes
   ========================================================================== */

function carregarClientes() {
  let clientes = lerDoStorage(CHAVES_STORAGE.clientes);
  if (!clientes) {
    clientes = obterClientesIniciais();
    salvarNoStorage(CHAVES_STORAGE.clientes, clientes);
  }
  return clientes;
}

function salvarClientes(clientes) {
  salvarNoStorage(CHAVES_STORAGE.clientes, clientes);
}

function adicionarCliente(cliente) {
  const clientes = carregarClientes();
  clientes.unshift(cliente); // o mais novo aparece primeiro na lista
  salvarClientes(clientes);
  return clientes;
}

/* ==========================================================================
   Camada de dados: projetos
   ========================================================================== */

function carregarProjetos() {
  let projetos = lerDoStorage(CHAVES_STORAGE.projetos);
  if (!projetos) {
    projetos = obterProjetosIniciais();
    salvarNoStorage(CHAVES_STORAGE.projetos, projetos);
  }
  return projetos;
}

function salvarProjetos(projetos) {
  salvarNoStorage(CHAVES_STORAGE.projetos, projetos);
}

function adicionarProjeto(projeto) {
  const projetos = carregarProjetos();
  projetos.unshift(projeto); // o mais novo aparece primeiro no painel
  salvarProjetos(projetos);
  return projetos;
}

/* ==========================================================================
   Validação de formulários (reutilizada pelos dois formulários)
   ========================================================================== */

function definirErroDeCampo(campo, mensagem) {
  const spanErro = document.getElementById("erro-" + campo.id);
  const wrapper = campo.closest(".field");

  if (mensagem) {
    wrapper.classList.add("has-error");
    campo.setAttribute("aria-invalid", "true");
    if (spanErro) {
      spanErro.textContent = mensagem;
    }
  } else {
    wrapper.classList.remove("has-error");
    campo.removeAttribute("aria-invalid");
    if (spanErro) {
      spanErro.textContent = "";
    }
  }
}

/* ==========================================================================
   1. Painel de projetos (src/index.html): renderização + busca
   ========================================================================== */

function initPainelDeProjetos() {
  const lista = document.getElementById("lista-projetos");
  const formulario = document.getElementById("form-busca");

  if (!lista || !formulario) {
    return; // esta função só faz sentido no Painel
  }

  const campoCliente = document.getElementById("busca-cliente");
  const campoStatus = document.getElementById("filtro-status");

  function renderizarProjetos(projetos) {
    lista.innerHTML = "";
    projetos.forEach(function (projeto) {
      lista.appendChild(criarCardDeProjeto(projeto));
    });
  }

  function filtrarProjetos() {
    const termo = campoCliente.value.trim().toLowerCase();
    const status = campoStatus.value;

    const cards = Array.from(lista.querySelectorAll(".card"));

    const resultados = cards.filter(function (card) {
      const clienteDoCard = (card.dataset.cliente || "").toLowerCase();
      const tituloDoCard = (card.dataset.titulo || "").toLowerCase();
      const statusDoCard = card.dataset.status || "";

      const correspondeAoTermo =
        termo === "" ||
        clienteDoCard.includes(termo) ||
        tituloDoCard.includes(termo);
      const correspondeAoStatus = status === "" || statusDoCard === status;

      return correspondeAoTermo && correspondeAoStatus;
    });

    cards.forEach(function (card) {
      card.hidden = resultados.indexOf(card) === -1;
    });

    exibirOuOcultarMensagemVazia(resultados.length === 0);
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

  // Carrega projetos originais + cadastrados pelo usuário e desenha os cards.
  renderizarProjetos(carregarProjetos());
  // Aplica o estado atual dos filtros (vazio, no primeiro carregamento).
  filtrarProjetos();

  campoCliente.addEventListener("input", filtrarProjetos);
  campoStatus.addEventListener("change", filtrarProjetos);

  // Clicar em "Filtrar" ou apertar Enter não deve recarregar a página.
  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    filtrarProjetos();
  });
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

/* ==========================================================================
   2 e 3. Validação e cadastro dinâmico de cliente (src/cliente.html)
   ========================================================================== */

function initFormularioCliente() {
  const formulario = document.getElementById("form-cliente");

  if (!formulario) {
    return; // esta função só faz sentido na página de Clientes
  }

  const campoNome = document.getElementById("nome");
  const campoTelefone = document.getElementById("telefone");
  const campoEmail = document.getElementById("email");
  const mensagemSucesso = document.getElementById("cliente-sucesso");
  const listaClientes = document.getElementById("lista-clientes");

  const regexTelefone = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function renderizarClientes(clientes) {
    const projetos = carregarProjetos();
    listaClientes.innerHTML = "";
    clientes.forEach(function (cliente) {
      listaClientes.appendChild(criarCardDeCliente(cliente, projetos));
    });
  }

  function validarFormulario() {
    let formularioValido = true;

    if (campoNome.value.trim() === "") {
      definirErroDeCampo(campoNome, "Informe o nome do cliente.");
      formularioValido = false;
    } else {
      definirErroDeCampo(campoNome, "");
    }

    const telefone = campoTelefone.value.trim();
    if (telefone === "") {
      definirErroDeCampo(campoTelefone, "Informe o telefone do cliente.");
      formularioValido = false;
    } else if (!regexTelefone.test(telefone)) {
      definirErroDeCampo(campoTelefone, "Use o formato (00) 00000-0000.");
      formularioValido = false;
    } else {
      definirErroDeCampo(campoTelefone, "");
    }

    const email = campoEmail.value.trim();
    if (email !== "" && !regexEmail.test(email)) {
      definirErroDeCampo(campoEmail, "Informe um e-mail válido.");
      formularioValido = false;
    } else {
      definirErroDeCampo(campoEmail, "");
    }

    return formularioValido;
  }

  // Desenha a lista a partir dos dados persistidos (originais + cadastrados).
  renderizarClientes(carregarClientes());

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (mensagemSucesso) {
      mensagemSucesso.hidden = true;
    }

    if (!validarFormulario()) {
      return;
    }

    const novoCliente = {
      id: gerarId("cliente"),
      nome: campoNome.value.trim(),
      telefone: campoTelefone.value.trim(),
      email: campoEmail.value.trim(),
    };

    const clientesAtualizados = adicionarCliente(novoCliente);
    renderizarClientes(clientesAtualizados);

    if (mensagemSucesso) {
      mensagemSucesso.hidden = false;
    }

    formulario.reset();
  });

  [campoNome, campoTelefone, campoEmail].forEach(function (campo) {
    campo.addEventListener("input", function () {
      const wrapper = campo.closest(".field");
      if (wrapper.classList.contains("has-error")) {
        validarFormulario();
      }
    });
  });
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
    link.textContent =
      projetosDoCliente.length > 0 ? "Ver projetos" : "Ver painel";
  }

  rodape.appendChild(contador);
  rodape.appendChild(link);

  artigo.appendChild(topo);
  artigo.appendChild(descricao);
  artigo.appendChild(rodape);

  return artigo;
}

/* ==========================================================================
   4. Validação e cadastro dinâmico de projeto (src/novo-projeto.html)
   ========================================================================== */

function initFormularioProjeto() {
  const formulario = document.getElementById("form-projeto");

  if (!formulario) {
    return; // esta função só faz sentido na página de Novo projeto
  }

  const campoCliente = document.getElementById("cliente");
  const campoTitulo = document.getElementById("titulo");
  const campoDescricao = document.getElementById("descricao");
  const campoAmbiente = document.getElementById("ambiente");
  const campoStatus = document.getElementById("status");
  const mensagemSucesso = document.getElementById("projeto-sucesso");

  function preencherSelectDeClientes() {
    const valorAtual = campoCliente.value;
    const clientes = carregarClientes();

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

    if (valorAtual) {
      campoCliente.value = valorAtual;
    }
  }

  function validarFormulario() {
    let formularioValido = true;

    if (campoCliente.value === "") {
      definirErroDeCampo(campoCliente, "Selecione um cliente.");
      formularioValido = false;
    } else {
      definirErroDeCampo(campoCliente, "");
    }

    if (campoTitulo.value.trim() === "") {
      definirErroDeCampo(campoTitulo, "Informe o título do projeto.");
      formularioValido = false;
    } else {
      definirErroDeCampo(campoTitulo, "");
    }

    if (campoDescricao.value.trim() === "") {
      definirErroDeCampo(campoDescricao, "Descreva o projeto para continuar.");
      formularioValido = false;
    } else {
      definirErroDeCampo(campoDescricao, "");
    }

    return formularioValido;
  }

  // Lista de clientes sempre atualizada: inclui os originais e os
  // cadastrados em cliente.html, sem duplicar.
  preencherSelectDeClientes();

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (mensagemSucesso) {
      mensagemSucesso.hidden = true;
    }

    if (!validarFormulario()) {
      return;
    }

    const clientes = carregarClientes();
    const clienteSelecionado = clientes.find(function (cliente) {
      return cliente.id === campoCliente.value;
    });

    const novoProjeto = {
      id: gerarId("projeto"),
      titulo: campoTitulo.value.trim(),
      clienteId: clienteSelecionado ? clienteSelecionado.id : campoCliente.value,
      clienteNome: clienteSelecionado
        ? clienteSelecionado.nome
        : campoCliente.options[campoCliente.selectedIndex].text,
      ambiente: campoAmbiente.value.trim(),
      descricao: campoDescricao.value.trim(),
      status: campoStatus.value,
      statusLabel: campoStatus.options[campoStatus.selectedIndex].text,
      dataCriacao: formatarDataAtual(),
      link: "",
    };

    adicionarProjeto(novoProjeto);

    mensagemSucesso.textContent =
      'Projeto "' +
      novoProjeto.titulo +
      '" cadastrado para ' +
      novoProjeto.clienteNome +
      " (status inicial: " +
      novoProjeto.statusLabel +
      "). Ele já aparece no Painel.";
    mensagemSucesso.hidden = false;

    formulario.reset();
    preencherSelectDeClientes();
  });

  [campoCliente, campoTitulo, campoDescricao].forEach(function (campo) {
    const evento = campo.tagName === "SELECT" ? "change" : "input";
    campo.addEventListener(evento, function () {
      const wrapper = campo.closest(".field");
      if (wrapper.classList.contains("has-error")) {
        validarFormulario();
      }
    });
  });
}
