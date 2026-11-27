/*
 * Migração dos dados da Etapa 04 (localStorage) para o servidor.
 *
 * Na Etapa 04 os cadastros ficavam no navegador. Para que nada se perca na
 * mudança para a API, na primeira vez que o sistema abre com dados antigos
 * eles são enviados ao servidor (que ignora o que já existe, comparando pelo
 * id) e, só depois do envio bem-sucedido, são apagados do navegador. Assim o
 * servidor passa a ser a única fonte de dados, sem duas cópias divergentes.
 *
 * Se o servidor estiver indisponível, nada é apagado e a migração é tentada
 * de novo no próximo carregamento.
 */

import { enviar } from "./api.js";
import { lerDoStorage, removerDoStorage } from "../utils/storage.js";

const CHAVES_ANTIGAS = {
  clientes: "madeiraflow:clientes",
  projetos: "madeiraflow:projetos",
};

export async function migrarDadosLocais() {
  const clientes = lerDoStorage(CHAVES_ANTIGAS.clientes);
  const projetos = lerDoStorage(CHAVES_ANTIGAS.projetos);

  const temDadosAntigos =
    (Array.isArray(clientes) && clientes.length > 0) ||
    (Array.isArray(projetos) && projetos.length > 0);

  if (!temDadosAntigos) {
    return null;
  }

  try {
    const resultado = await enviar(
      "/migracao",
      { clientes: clientes || [], projetos: projetos || [] },
      { limiteMs: 4000 }
    );

    removerDoStorage(CHAVES_ANTIGAS.clientes);
    removerDoStorage(CHAVES_ANTIGAS.projetos);
    return resultado;
  } catch (erro) {
    // API indisponível agora: os dados antigos ficam guardados para a próxima tentativa
    return null;
  }
}
