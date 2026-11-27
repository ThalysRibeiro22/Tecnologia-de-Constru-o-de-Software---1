"use strict";

class ErroAplicacao extends Error {
  constructor(status, codigo, mensagem, detalhes) {
    super(mensagem);
    this.name = "ErroAplicacao";
    this.status = status;
    this.codigo = codigo;
    this.detalhes = detalhes;
  }
}

module.exports = ErroAplicacao;
