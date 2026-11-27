"use strict";

const fs = require("fs");
const path = require("path");

const arquivo = path.resolve(process.env.DATABASE_PATH || path.join(__dirname, "madeiraflow.sqlite"));
// O reset explícito restaura o conjunto inicial e não deve reimportar o JSON legado.
process.env.LEGACY_JSON_PATH = path.join(path.dirname(arquivo), ".legacy-import-disabled");
for (const sufixo of ["", "-wal", "-shm"]) {
  const alvo = arquivo + sufixo;
  if (fs.existsSync(alvo)) fs.unlinkSync(alvo);
}
require("./database/connection");
const { db } = require("./database/connection");
db.prepare("INSERT OR IGNORE INTO app_meta (chave, valor) VALUES ('dados_json_importado', ?)").run(new Date().toISOString());
db.close();
console.log("Banco recriado com os dados iniciais: " + arquivo);
