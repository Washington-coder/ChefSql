CREATE TABLE geladeira (
  id          INTEGER PRIMARY KEY,
  ingrediente TEXT NOT NULL,
  quantidade  INTEGER NOT NULL DEFAULT 0,
  validade    TEXT NOT NULL,
  categoria   TEXT NOT NULL,
  preco_custo REAL NOT NULL DEFAULT 0
);

CREATE TABLE clientes (
  id              INTEGER PRIMARY KEY,
  mesa            INTEGER NOT NULL,
  status          TEXT NOT NULL,
  numero_pessoas  INTEGER NOT NULL DEFAULT 1,
  horario_chegada TEXT NOT NULL
);

CREATE TABLE pedidos (
  id           INTEGER PRIMARY KEY,
  mesa_id      INTEGER NOT NULL REFERENCES clientes(id),
  prato_pedido TEXT NOT NULL,
  prioridade   TEXT NOT NULL
);

CREATE TABLE receitas (
  id                    INTEGER PRIMARY KEY,
  nome_prato            TEXT NOT NULL,
  ingrediente_necessario TEXT NOT NULL,
  quantidade_necessaria INTEGER NOT NULL
);
