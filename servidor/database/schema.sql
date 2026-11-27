PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY NOT NULL,
  nome TEXT NOT NULL CHECK (length(trim(nome)) > 0),
  telefone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projetos (
  id TEXT PRIMARY KEY NOT NULL,
  titulo TEXT NOT NULL CHECK (length(trim(titulo)) > 0),
  cliente_id TEXT NOT NULL,
  ambiente TEXT NOT NULL DEFAULT '',
  descricao TEXT NOT NULL CHECK (length(trim(descricao)) > 0),
  status TEXT NOT NULL DEFAULT 'orcamento'
    CHECK (status IN ('orcamento', 'aprovado', 'producao', 'pronto', 'entregue')),
  data_criacao TEXT NOT NULL,
  link TEXT NOT NULL DEFAULT '',
  CONSTRAINT fk_projetos_clientes
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_projetos_cliente_id ON projetos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_projetos_status ON projetos(status);

CREATE TABLE IF NOT EXISTS app_meta (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);
