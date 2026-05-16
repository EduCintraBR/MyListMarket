-- Migration 0001 — baseline schema for MyListMarket V1.0
-- See specs/_shared/data-model.md

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS produtos (
  id              TEXT PRIMARY KEY,
  nome            TEXT NOT NULL,
  marca_padrao    TEXT,
  modelo_padrao   TEXT,
  unidade_padrao  TEXT,
  criado_em       INTEGER NOT NULL,
  excluido_em     INTEGER
);

CREATE INDEX IF NOT EXISTS idx_produto_nome
  ON produtos (nome COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS mercados (
  id           TEXT PRIMARY KEY,
  nome         TEXT NOT NULL,
  observacoes  TEXT,
  criado_em    INTEGER NOT NULL,
  excluido_em  INTEGER
);

CREATE TABLE IF NOT EXISTS listas (
  id              TEXT PRIMARY KEY,
  nome            TEXT,
  status          TEXT NOT NULL,
  criado_em       INTEGER NOT NULL,
  finalizada_em   INTEGER,
  excluido_em     INTEGER
);

CREATE TABLE IF NOT EXISTS itens_lista (
  id                    TEXT PRIMARY KEY,
  lista_id              TEXT NOT NULL,
  produto_id            TEXT NOT NULL,
  quantidade_planejada  REAL,
  marca                 TEXT,
  modelo                TEXT,
  unidade               TEXT,
  origem                TEXT NOT NULL DEFAULT 'lista',
  status                TEXT NOT NULL DEFAULT 'a_comprar',
  quantidade_comprada   REAL,
  preco_unitario        REAL,
  criado_em             INTEGER NOT NULL,
  FOREIGN KEY (lista_id) REFERENCES listas(id) ON DELETE RESTRICT,
  FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_item_lista_id ON itens_lista (lista_id);
CREATE INDEX IF NOT EXISTS idx_item_produto_id ON itens_lista (produto_id);

CREATE TABLE IF NOT EXISTS compras (
  id                TEXT PRIMARY KEY,
  lista_id          TEXT NOT NULL,
  mercado_id        TEXT NOT NULL,
  data_hora         INTEGER NOT NULL,
  forma_pagamento   TEXT NOT NULL,
  total_calculado   REAL NOT NULL,
  total_real        REAL,
  foto_cupom_path   TEXT,
  criado_em         INTEGER NOT NULL,
  excluido_em       INTEGER,
  FOREIGN KEY (lista_id) REFERENCES listas(id) ON DELETE RESTRICT,
  FOREIGN KEY (mercado_id) REFERENCES mercados(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_compra_data ON compras (data_hora);
CREATE INDEX IF NOT EXISTS idx_compra_mercado ON compras (mercado_id);
