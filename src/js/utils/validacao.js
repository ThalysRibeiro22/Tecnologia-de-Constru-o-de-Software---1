/*
 * Funções reutilizáveis de validação dos formulários.
 *
 * Cada função recebe o valor digitado e devolve a mensagem de erro
 * correspondente, ou uma string vazia quando o valor é válido. Assim a mesma
 * regra serve para qualquer formulário e é fácil de testar isoladamente.
 */

export const REGEX_TELEFONE = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;
export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarNome(valor) {
  return valor.trim() === "" ? "Informe o nome do cliente." : "";
}

export function validarTelefone(valor) {
  const telefone = valor.trim();
  if (telefone === "") return "Informe o telefone do cliente.";
  if (!REGEX_TELEFONE.test(telefone)) return "Use o formato (00) 00000-0000.";
  return "";
}

// O e-mail é opcional: só é validado quando preenchido.
export function validarEmail(valor) {
  const email = valor.trim();
  if (email !== "" && !REGEX_EMAIL.test(email)) return "Informe um e-mail válido.";
  return "";
}

export function validarSelecaoDeCliente(valor) {
  return valor === "" ? "Selecione um cliente." : "";
}

export function validarTitulo(valor) {
  return valor.trim() === "" ? "Informe o título do projeto." : "";
}

export function validarDescricao(valor) {
  return valor.trim() === "" ? "Descreva o projeto para continuar." : "";
}
