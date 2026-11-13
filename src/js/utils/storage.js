/*
 * Acesso seguro ao localStorage.
 *
 * Desde a Etapa 05 os clientes e projetos ficam no servidor (API), então o
 * localStorage deixou de ser a fonte de dados. Este módulo continua existindo
 * apenas para ler (e depois limpar) os dados antigos da Etapa 04, durante a
 * migração feita em services/migracaoService.js.
 */

export function lerDoStorage(chave) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : null;
  } catch (erro) {
    // Navegador bloqueou o armazenamento ou o conteúdo está corrompido
    return null;
  }
}

export function salvarNoStorage(chave, dados) {
  try {
    localStorage.setItem(chave, JSON.stringify(dados));
    return true;
  } catch (erro) {
    return false;
  }
}

export function removerDoStorage(chave) {
  try {
    localStorage.removeItem(chave);
  } catch (erro) {
    // sem ação: se não for possível remover, a migração tenta de novo no próximo carregamento
  }
}
